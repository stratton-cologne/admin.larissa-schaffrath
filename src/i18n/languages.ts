// src/i18n/languages.ts
export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const FALLBACK_LOCALE: Locale = "de";
export const STORAGE_KEY = "locale";
