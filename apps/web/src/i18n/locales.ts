import type { SupportedLocale } from "@ffxiv-guide-engine/types";

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["en", "tr"] as const;

export const DEFAULT_LOCALE: SupportedLocale = "en";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
