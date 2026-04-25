import type { ScraperEnv } from "../config/read-env";

export async function completeJob(
  env: ScraperEnv,
  input: Readonly<{ jobId: string; status: "completed" | "failed"; errorMessage?: string }>
): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/api/internal/jobs/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": env.internalToken
    },
    body: JSON.stringify({
      jobId: input.jobId,
      status: input.status,
      errorMessage: input.errorMessage
    })
  });
  if (!response.ok) {
    throw new Error(`complete job failed: ${response.status}`);
  }
}
