import type { NormalizedGuide } from "../adapters/normalized-guide";
import type { ScraperEnv } from "../config/read-env";

export async function persistGuide(env: ScraperEnv, guide: NormalizedGuide): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/api/internal/guides/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": env.internalToken
    },
    body: JSON.stringify({
      slug: guide.slug,
      locale: guide.locale,
      title: guide.title,
      summary: guide.summary,
      bodyMarkdown: guide.bodyMarkdown,
      category: guide.category,
      tags: guide.tags,
      isPublished: false
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upsert failed: ${response.status} ${text}`);
  }
}
