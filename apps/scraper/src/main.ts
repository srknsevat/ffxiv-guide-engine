import { Queue, Worker } from "bullmq";
import type { ScraperEnv } from "./config/read-env";
import { readScraperEnv } from "./config/read-env";
import { claimNextJob } from "./jobs/claim-next-job";
import { completeJob } from "./jobs/complete-job";
import { persistGuide } from "./pipeline/persist-guide";
import { reportSourceHealth } from "./pipeline/report-source-health";
import { resolveSourceAdapter } from "./adapters/source-adapter-registry";

const SCRAPER_QUEUE_NAME = "scraper";
const DEAD_LETTER_QUEUE_NAME = "scraper-dead-letter";

type WorkerJobData = Readonly<{
  apiJobId: string;
  sourceKey: string;
}>;

async function processApiJob(env: ScraperEnv, data: WorkerJobData): Promise<void> {
  const adapter = resolveSourceAdapter(data.sourceKey);
  try {
    const guides = await adapter.fetchNormalized(env);
    for (const guide of guides) {
      await persistGuide(env, guide);
    }
    await reportSourceHealth(env, { sourceKey: data.sourceKey, isHealthy: true });
    await completeJob(env, { jobId: data.apiJobId, status: "completed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await reportSourceHealth(env, {
      sourceKey: data.sourceKey,
      isHealthy: false,
      lastError: message
    });
    throw err;
  }
}

async function bootstrap(): Promise<void> {
  if (process.env.SCRAPER_ENABLED === "false") {
    process.stdout.write("Scraper disabled via SCRAPER_ENABLED=false.\n");
    return;
  }
  const env = readScraperEnv();
  if (!env.internalToken) {
    throw new Error("INTERNAL_API_TOKEN is required for the scraper.");
  }
  const connection = { url: env.redisUrl };
  const queue = new Queue<WorkerJobData>(SCRAPER_QUEUE_NAME, { connection });
  const deadLetterQueue = new Queue<
    WorkerJobData & { errorMessage: string; failedAt: string; attemptsMade: number }
  >(DEAD_LETTER_QUEUE_NAME, { connection });
  const worker = new Worker<WorkerJobData>(
    SCRAPER_QUEUE_NAME,
    async (job) => {
      await processApiJob(env, job.data);
    },
    {
      connection,
      concurrency: env.workerConcurrency
    }
  );
  worker.on("failed", (job, error) => {
    if (!job) {
      return;
    }
    const data = job.data;
    const attemptsMade = job.attemptsMade;
    const hasExhaustedAttempts = attemptsMade >= env.maxAttempts;
    if (!hasExhaustedAttempts) {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    void deadLetterQueue.add(
      `dead-letter-${data.apiJobId}`,
      {
        ...data,
        attemptsMade,
        failedAt: new Date().toISOString(),
        errorMessage
      },
      { removeOnComplete: 1000, removeOnFail: 1000 }
    );
    void completeJob(env, {
      jobId: data.apiJobId,
      status: "failed",
      errorMessage
    });
  });
  const timer = setInterval(() => {
    void (async () => {
      try {
        const claimed = await claimNextJob(env);
        if (!claimed) {
          return;
        }
        await queue.add(
          "ingest",
          {
            apiJobId: claimed.id,
            sourceKey: claimed.sourceKey
          },
          {
            jobId: claimed.id,
            attempts: env.maxAttempts,
            backoff: {
              type: "fixed",
              delay: env.retryBackoffMs
            },
            removeOnComplete: 1000,
            removeOnFail: 1000
          }
        );
      } catch {
        // Claim loop must never crash the process.
      }
    })();
  }, env.pollIntervalMs);
  const shutdown = async (): Promise<void> => {
    clearInterval(timer);
    await worker.close();
    await queue.close();
    await deadLetterQueue.close();
  };
  process.on("SIGINT", () => {
    void shutdown().finally(() => process.exit(0));
  });
  process.on("SIGTERM", () => {
    void shutdown().finally(() => process.exit(0));
  });
}

void bootstrap();
