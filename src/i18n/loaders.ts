// src/i18n/loaders.ts
import type { Locale } from "./languages";

export const messageLoaders: Record<Locale, () => Promise<any>> = {
    de: () => import("./messages/de"),
    en: () => import("./messages/en"),
} as const;
