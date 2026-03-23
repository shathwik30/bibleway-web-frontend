"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";
import ar from "./locales/ar.json";
import sw from "./locales/sw.json";

const locales: Record<string, any> = { en, es, fr, hi, pt, ar, sw };

type TranslationFn = (key: string, fallback?: string) => string;

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: TranslationFn;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_language");
      if (saved && locales[saved]) setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((code: string) => {
    if (locales[code]) {
      setLocaleState(code);
      if (typeof window !== "undefined") {
        localStorage.setItem("app_language", code);
        document.documentElement.lang = code;
        document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
      }
    }
  }, []);

  const t: TranslationFn = useCallback((key: string, fallback?: string) => {
    const parts = key.split(".");
    let value: any = locales[locale];
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    if (typeof value === "string") return value;

    // Fallback to English
    let enValue: any = locales.en;
    for (const part of parts) {
      enValue = enValue?.[part];
      if (enValue === undefined) break;
    }
    if (typeof enValue === "string") return enValue;

    return fallback || key;
  }, [locale]);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
