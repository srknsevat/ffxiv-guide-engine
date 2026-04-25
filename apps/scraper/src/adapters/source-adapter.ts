import type { ScraperEnv } from "../config/read-env";
import type { NormalizedGuide } from "./normalized-guide";

export type SourceAdapter = Readonly<{
  sourceKey: string;
  fetchNormalized: (env: ScraperEnv) => Promise<NormalizedGuide[]>;
}>;
