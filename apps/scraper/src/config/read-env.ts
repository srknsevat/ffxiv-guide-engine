export type ScraperEnv = Readonly<{
  apiBaseUrl: string;
  internalToken: string;
  redisUrl: string;
  pollIntervalMs: number;
  maxAttempts: number;
  retryBackoffMs: number;
  workerConcurrency: number;
  fetchTimeoutMs: number;
  maxFetchRetries: number;
}>;

/**
 * Reads and validates scraper runtime configuration.
 */
export function readScraperEnv(): ScraperEnv {
  const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3001").replace(/\/$/, "");
  const internalToken = process.env.INTERNAL_API_TOKEN ?? "";
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  const pollIntervalMs = Number(process.env.SCRAPER_POLL_INTERVAL_MS ?? 2000);
  const maxAttempts = Number(process.env.SCRAPER_MAX_ATTEMPTS ?? 3);
  const retryBackoffMs = Number(process.env.SCRAPER_RETRY_BACKOFF_MS ?? 3000);
  const workerConcurrency = Number(process.env.SCRAPER_WORKER_CONCURRENCY ?? 2);
  const fetchTimeoutMs = Number(process.env.SCRAPER_FETCH_TIMEOUT_MS ?? 15000);
  const maxFetchRetries = Number(process.env.SCRAPER_FETCH_MAX_RETRIES ?? 2);
  return {
    apiBaseUrl,
    internalToken,
    redisUrl,
    pollIntervalMs,
    maxAttempts,
    retryBackoffMs,
    workerConcurrency,
    fetchTimeoutMs,
    maxFetchRetries
  };
}
