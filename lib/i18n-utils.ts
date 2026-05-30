import type { LocalizedString, LocalizedStringArray } from "@/types";

/**
 * Pick the value for the given locale from a LocalizedString.
 * Falls back to the fallback locale, then the first available key.
 */
export function localized(
  val: LocalizedString,
  locale: string,
  fallbackLocale = "en"
): string {
  return val[locale] ?? val[fallbackLocale] ?? Object.values(val)[0] ?? "";
}

/**
 * Pick the array for the given locale from a LocalizedStringArray.
 * Falls back to the fallback locale, then the first available key.
 */
export function localizedArray(
  val: LocalizedStringArray,
  locale: string,
  fallbackLocale = "en"
): string[] {
  return val[locale] ?? val[fallbackLocale] ?? Object.values(val)[0] ?? [];
}
