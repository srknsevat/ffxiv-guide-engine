import type { SourceAdapter } from "./source-adapter";
import { createDemoSourceAdapter } from "./demo-source.adapter";
import { createHttpJsonSourceAdapter } from "./http-json-source.adapter";
import { createLodestoneNewsAdapter } from "./lodestone-news.adapter";

/**
 * Resolves adapters by source key; falls back to demo adapter.
 */
export function resolveSourceAdapter(sourceKey: string): SourceAdapter {
  if (sourceKey === "lodestone-news") {
    return createLodestoneNewsAdapter();
  }
  const httpJsonAdapter = createHttpJsonSourceAdapter(sourceKey);
  if (httpJsonAdapter) {
    return httpJsonAdapter;
  }
  return createDemoSourceAdapter(sourceKey);
}
