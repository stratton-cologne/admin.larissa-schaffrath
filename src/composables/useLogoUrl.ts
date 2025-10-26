/**
 * @file useLogoUrl.ts
 * @brief Liefert App-Titel und Logo-URL (Env > lokales Asset > Fallback).
 * @details
 *  - Liest Titel und Logo-URL aus Vite-Env (VITE_APP_TITLE, VITE_APP_LOGO_URL).
 *  - Falls keine Env-Logo-URL gesetzt ist, wird das erste lokale Logo unter
 *    `/src/assets/logo.*` verwendet (per `import.meta.glob`, eager).
 *  - Ergibt eine reaktive `logoUrl` als `computed`.
 */

import { computed } from "vue";

/**
 * @brief Composable zur Ermittlung des App-Titels und der Logo-URL.
 * @returns `{ appTitle, logoUrl }`
 */
export function useLogoUrl() {
    /** @brief App-Titel mit Default. */
    const appTitle =
        (import.meta.env.VITE_APP_TITLE as string | undefined) ||
        "Stratton Cologne";

    /** @brief Logo-URL aus Env (falls gesetzt). */
    const envLogo =
        (import.meta.env.VITE_APP_LOGO_URL as string | undefined) || "";

    /**
     * @brief Lokale Logo-Assets (erstes Match wird genutzt).
     * @note `as: "url"` erzeugt eine gebündelte URL (Asset-URL zur Laufzeit).
     */
    const localLogos = import.meta.glob("/src/assets/image/logo.*", {
        eager: true,
        as: "url",
    }) as Record<string, string>;

    const firstLocalLogo = Object.values(localLogos)[0] as string | undefined;

    /**
     * @brief Effektive Logo-URL in Priorität: Env → lokal → leer.
     */
    const logoUrl = computed<string>(() => envLogo || firstLocalLogo || "");

    return { appTitle, logoUrl };
}
