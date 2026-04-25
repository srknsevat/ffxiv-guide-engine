import type { ScraperEnv } from "../config/read-env";

export type ClaimedJob = Readonly<{
  id: string;
  sourceKey: string;
  status: string;
}>;

export async function claimNextJob(env: ScraperEnv): Promise<ClaimedJob | null> {
  const response = await fetch(`${env.apiBaseUrl}/api/internal/jobs/claim-next`, {
    method: "POST",
    headers: { "x-internal-token": env.internalToken }
  });
  if (!response.ok) {
    throw new Error(`claim-next failed: ${response.status}`);
  }
  const body = (await response.json()) as ClaimedJob | null;
  return body;
}
