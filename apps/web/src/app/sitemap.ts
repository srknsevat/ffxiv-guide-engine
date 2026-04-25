import type { MetadataRoute } from "next";
import type { SupportedLocale } from "@ffxiv-guide-engine/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

async function fetchSlugs(locale: SupportedLocale): Promise<string[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/guides?locale=${locale}`, {
      next: { revalidate: 300 }
    });
    if (!response.ok) {
      return [];
    }
    const rows = (await response.json()) as { slug: string }[];
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  const locales: SupportedLocale[] = ["en", "tr"];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    entries.push({
      url: `${site}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    });
    const slugs = await fetchSlugs(locale);
    for (const slug of slugs) {
      entries.push({
        url: `${site}/${locale}/guides/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7
      });
    }
  }
  return entries;
}
