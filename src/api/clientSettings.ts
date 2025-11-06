import api from "@/lib/axios";

export type FontSource = {
    name?: string | null;
    media_id?: number | null; // Datei aus Mediathek (ttf/otf/woff/woff2)
    url?: string | null; // externe Quelle (z. B. Google Fonts CSS URL)
};

export type Background = {
    type?: "none" | "image" | "video";
    media_id?: number | null;
    url?: string | null;
    fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    position?: string; // 'center', 'top', 'left top' …
    overlay?: string; // 'none' oder CSS-Farbe mit Alpha z. B. 'rgba(0,0,0,.3)'
};

export type ClientSettings = {
    primary_color: string;
    secondary_color: string;
    primary_font: FontSource;
    secondary_font: FontSource;
    background: Background;
    brand_name?: string | null;
    brand_subtitle?: string | null;
};

export async function fetchClientSettings(): Promise<ClientSettings> {
    const { data } = await api.get("/api/client-settings");
    return data;
}

export async function saveClientSettings(
    payload: Partial<ClientSettings>,
): Promise<ClientSettings> {
    const { data } = await api.put("/api/client-settings", payload);
    return data;
}
