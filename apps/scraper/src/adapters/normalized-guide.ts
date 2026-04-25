import type { GuideCategory, SupportedLocale } from "@ffxiv-guide-engine/types";

export type NormalizedGuide = Readonly<{
  slug: string;
  locale: SupportedLocale;
  title: string;
  summary: string;
  bodyMarkdown: string;
  category: GuideCategory;
  tags: readonly string[];
}>;
