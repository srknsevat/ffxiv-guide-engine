import type { ScraperEnv } from "../config/read-env";

export async function reportSourceHealth(
  env: ScraperEnv,
  input: Readonly<{ sourceKey: string; isHealthy: boolean; lastError?: string }>
): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/api/sources/health/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": env.internalToken
    },
    body: JSON.stringify({
      sourceKey: input.sourceKey,
      isHealthy: input.isHealthy,
      lastError: input.lastError
    })
  });
  if (!response.ok) {
    throw new Error(`Health report failed: ${response.status}`);
  }
}
