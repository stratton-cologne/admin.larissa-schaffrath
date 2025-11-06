import { ref } from "vue";
import type { ClientSettings, FontSource } from "@/api/clientSettings";
import { fetchClientSettings } from "@/api/clientSettings";
import { fetchMediaBlob } from "@/api/media";

const current = ref<ClientSettings | null>(null);
const objectUrls = new Set<string>();

function revokeAll() {
    for (const u of objectUrls) URL.revokeObjectURL(u);
    objectUrls.clear();
}

function setCSSVars(s: ClientSettings) {
    const root = document.documentElement;
    root.style.setProperty("--client-primary", s.primary_color || "#0ea5e9");
    root.style.setProperty(
        "--client-secondary",
        s.secondary_color || "#f59e0b",
    );
}

/** Lädt Font aus Media (Blob) oder URL und injiziert @font-face */
async function loadFont(which: "primary" | "secondary", src: FontSource) {
    // Entferne alte Face-Tag (optional – hier simpel: wir hängen neue an)
    const faceName =
        (src?.name || "").trim() ||
        (which === "primary" ? "ClientPrimary" : "ClientSecondary");

    let cssUrl: string | null = null;

    if (src?.media_id) {
        try {
            const blob = await fetchMediaBlob(src.media_id);
            const url = URL.createObjectURL(blob);
            objectUrls.add(url);
            cssUrl = url;
        } catch {
            /* ignore */
        }
    } else if (src?.url) {
        // Wenn Google Fonts CSS-URL: einfach <link> einhängen und Family per name benutzen
        if (src.url.includes("fonts.googleapis.com")) {
            const l = document.createElement("link");
            l.rel = "stylesheet";
            l.href = src.url;
            document.head.appendChild(l);
            // Hier reicht es, family-Namen (src.name) später im CSS zu nutzen
            return { family: faceName };
        } else {
            cssUrl = src.url;
        }
    }

    if (cssUrl) {
        const style = document.createElement("style");
        style.textContent = `
      @font-face {
        font-family: "${faceName}";
        src: url("${cssUrl}");
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
        document.head.appendChild(style);
        return { family: faceName };
    }

    return { family: "system-ui" };
}

async function applyClientTheme(s: ClientSettings) {
    revokeAll();
    setCSSVars(s);

    const p = await loadFont("primary", s.primary_font || {});
    const s2 = await loadFont("secondary", s.secondary_font || {});

    // Du kannst hier globale Utility-Klassen setzen:
    const root = document.documentElement;
    root.style.setProperty("--client-font-primary", p?.family || "system-ui");
    root.style.setProperty(
        "--client-font-secondary",
        s2?.family || "system-ui",
    );

    // Hintergrund-Variablen
    const bg = s.background || {};
    root.style.setProperty("--client-bg-fit", bg.fit || "cover");
    root.style.setProperty("--client-bg-position", bg.position || "center");
    root.style.setProperty("--client-bg-overlay", bg.overlay || "none");

    // Bild/Video übernimmt die Client-Komponente (siehe unten Admin-View Vorschau)
}

export async function initClientTheme() {
    const s = await fetchClientSettings();
    current.value = s;
    await applyClientTheme(s);
    return s;
}

export function useClientTheme() {
    return { current, applyClientTheme };
}
