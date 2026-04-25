import type { GuideCategory, SupportedLocale } from "@ffxiv-guide-engine/types";
import type { ScraperEnv } from "../config/read-env";
import { executeWithRetry } from "../utils/execute-with-retry";
import { fetchJsonWithTimeout } from "../utils/fetch-json-with-timeout";
import type { NormalizedGuide } from "./normalized-guide";
import type { SourceAdapter } from "./source-adapter";

type HttpJsonRow = Readonly<{
  slug: string;
  locale: SupportedLocale;
  title: string;
  summary: string;
  bodyMarkdown: string;
  category?: GuideCategory;
  tags?: readonly string[];
}>;

type HttpJsonConfig = Readonly<{
  sourceKey: string;
  url: string;
}>;

function parseHttpJsonConfig(sourceKey: string): HttpJsonConfig | null {
  if (!sourceKey.startsWith("http-json:")) {
    return null;
  }
  const url = sourceKey.replace("http-json:", "").trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }
  return { sourceKey, url };
}

function toNormalizedRows(rows: readonly HttpJsonRow[]): NormalizedGuide[] {
  return rows.map((row) => ({
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    summary: row.summary,
    bodyMarkdown: row.bodyMarkdown,
    category: row.category ?? "general",
    tags: row.tags ?? []
  }));
}

/**
 * Adapter for JSON sources using `http-json:<url>` source keys.
 */
export function createHttpJsonSourceAdapter(sourceKey: string): SourceAdapter | null {
  const config = parseHttpJsonConfig(sourceKey);
  if (!config) {
    return null;
  }
  return {
    sourceKey: config.sourceKey,
    async fetchNormalized(env: ScraperEnv): Promise<NormalizedGuide[]> {
      const rows = await executeWithRetry<readonly HttpJsonRow[]>({
        operation: () =>
          fetchJsonWithTimeout<readonly HttpJsonRow[]>({
            url: config.url,
            timeoutMs: env.fetchTimeoutMs
          }),
        retries: env.maxFetchRetries,
        baseDelayMs: env.retryBackoffMs
      });
      return toNormalizedRows(rows);
    }
  };
}
