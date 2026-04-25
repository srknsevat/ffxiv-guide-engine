import type { SupportedLocale } from "@ffxiv-guide-engine/types";

export type JsonLdGraph = Readonly<{
  "@context": "https://schema.org";
  "@graph": readonly Record<string, unknown>[];
}>;

export type BuildArticleSchemaInput = Readonly<{
  locale: SupportedLocale;
  title: string;
  description: string;
  url: string;
  dateModified: string;
}>;

/**
 * Builds Article JSON-LD for guide pages.
 */
export function buildArticleJsonLd(input: BuildArticleSchemaInput): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: input.title,
        description: input.description,
        inLanguage: input.locale === "tr" ? "tr-TR" : "en-US",
        dateModified: input.dateModified,
        mainEntityOfPage: { "@type": "WebPage", "@id": input.url }
      }
    ]
  };
}

/**
 * Builds BreadcrumbList JSON-LD.
 */
export function buildBreadcrumbJsonLd(
  items: readonly { name: string; url: string }[]
): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      }
    ]
  };
}
