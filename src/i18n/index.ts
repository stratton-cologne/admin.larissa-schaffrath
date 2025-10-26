// src/i18n/index.ts
import { createI18n } from "vue-i18n";
import { messageLoaders } from "./loaders";
import {
    SUPPORTED_LOCALES,
    FALLBACK_LOCALE,
    STORAGE_KEY,
    type Locale,
} from "./languages";

function detectLocale(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
    const nav = navigator.language?.slice(0, 2) as Locale | undefined;
    if (nav && SUPPORTED_LOCALES.includes(nav)) return nav;
    return FALLBACK_LOCALE;
}

export const i18n = createI18n({
    legacy: false,
    locale: detectLocale(),
    fallbackLocale: FALLBACK_LOCALE,
    messages: {},
});

export async function setLocale(locale: Locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return;

    // nur laden, wenn noch nicht vorhanden
    if (!i18n.global.availableLocales.includes(locale)) {
        const loader = messageLoaders[locale]; // nie undefined (Record<Locale,...>)
        // (zusätzliche Defensive – beruhigt selbst strengste TS-Einstellungen)
        if (!loader) throw new Error(`Missing loader for locale: ${locale}`);
        const mod = await loader();
        i18n.global.setLocaleMessage(locale, mod.default ?? mod);
    }

    i18n.global.locale.value = locale;
    localStorage.setItem(STORAGE_KEY, locale);
}

export async function ensureInitialLocale() {
    await setLocale(i18n.global.locale.value as Locale);
}
