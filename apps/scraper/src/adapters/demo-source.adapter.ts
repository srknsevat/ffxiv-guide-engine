import type { ScraperEnv } from "../config/read-env";
import type { NormalizedGuide } from "./normalized-guide";
import type { SourceAdapter } from "./source-adapter";

/**
 * Demo adapter producing deterministic placeholder guides for both locales.
 */
export function createDemoSourceAdapter(sourceKey: string): SourceAdapter {
  return {
    sourceKey,
    async fetchNormalized(env: ScraperEnv): Promise<NormalizedGuide[]> {
      const retrySummary = `retry=${env.maxAttempts}`;
      return [
        {
          slug: "demo",
          locale: "en",
          title: `Demo guide (EN) - ${sourceKey}`,
          summary: `Automatically generated demo content (${retrySummary}).`,
          bodyMarkdown: "## Demo\nThis guide is produced by the scraper worker.",
          category: "guide",
          tags: ["demo", sourceKey]
        },
        {
          slug: "demo",
          locale: "tr",
          title: `Demo rehber (TR) - ${sourceKey}`,
          summary: `Scraper tarafından üretilen örnek içerik (${retrySummary}).`,
          bodyMarkdown: "## Demo\nBu rehber worker tarafından üretildi.",
          category: "guide",
          tags: ["demo", sourceKey]
        }
      ];
    }
  };
}
