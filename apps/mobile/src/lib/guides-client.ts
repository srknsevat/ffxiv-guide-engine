import type { GuideSummaryDto, SupportedLocale } from "@ffxiv-guide-engine/types";
import { getApiBaseUrl } from "./api-base-url";

export async function fetchPublishedGuides(locale: SupportedLocale): Promise<GuideSummaryDto[]> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/guides?locale=${locale}`);
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as GuideSummaryDto[];
}
