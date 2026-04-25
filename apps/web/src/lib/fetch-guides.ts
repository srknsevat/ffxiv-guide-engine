import type { GuideDetailDto, GuideSummaryDto, SupportedLocale } from "@ffxiv-guide-engine/types";
import { getApiBaseUrl } from "./api-base-url";

export async function fetchPublishedGuides(locale: SupportedLocale): Promise<GuideSummaryDto[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/guides?locale=${locale}`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as GuideSummaryDto[];
  } catch {
    return [];
  }
}

export async function fetchGuideBySlug(
  slug: string,
  locale: SupportedLocale
): Promise<GuideDetailDto | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/guides/${encodeURIComponent(slug)}?locale=${locale}`,
      {
        next: { revalidate: 60 }
      }
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as GuideDetailDto;
  } catch {
    return null;
  }
}
