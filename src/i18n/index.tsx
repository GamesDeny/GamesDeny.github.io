"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import en, { type Translations } from "./locales/en";
import it from "./locales/it";

export type Locale = "en" | "it";

const locales: Record<Locale, Translations> = { en, it };

/** All available locales — add new ones here and the UI updates automatically. */
export const availableLocales = Object.keys(locales) as Locale[];

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [locale, setLocale] = useState<Locale>("en");

  const setLocaleCallback = useCallback((l: Locale) => setLocale(l), []);
  const toggleLocale = useCallback(
    () => setLocale((l) => (l === "en" ? "it" : "en")),
    []
  );

  const localeObj = useMemo(() => ({ locale, t: locales[locale], setLocale, toggleLocale }), [
    locale,
    setLocaleCallback,
    toggleLocale
  ]);
  return (
    <I18nContext.Provider value={localeObj}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
