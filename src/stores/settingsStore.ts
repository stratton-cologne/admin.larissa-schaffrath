import { defineStore } from "pinia";
import axios from "@/lib/axios";
import { env } from "@/lib/env";
import { useTheme } from "@/composables/useTheme";
import type { ThemePayload } from "@/composables/useTheme"; // TS1484: Typ-Only-Import

type AdminSettings = {
    id?: number;
    title: string;
    logo_light_media_id: number | null;
    logo_dark_media_id: number | null;
    theme: ThemePayload;
    logo_light_url?: string | null;
    logo_dark_url?: string | null;
};

function u(path: string) {
    return `${env.apiBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export const useSettingsStore = defineStore("settings", {
    state: (): { settings: AdminSettings | null; loading: boolean } => ({
        settings: null,
        loading: false,
    }),

    getters: {
        // Beispiel-Getter: aktuelle Theme-Branch (mit Fallback)
        currentThemeBranch: (state) => {
            const t = state.settings?.theme;
            if (!t) {
                // Fallback (verhindert „null“ an Aufrufer)
                return {
                    primary: "#ff9900",
                    text: "#67748e",
                    background: "#ffffff",
                    accent: "#10b981",
                    accentText: "#ffffff",
                    accentBackground: "#f8f9fa",
                    sidebarBackground: "#ffffff",
                    sidebarText: "#1f2937",
                    navBackground: "#ffffff",
                    navText: "#1f2937",
                };
            }
            const isDark =
                t.mode === "dark" ||
                (t.mode === "system" &&
                    typeof window !== "undefined" &&
                    window.matchMedia?.("(prefers-color-scheme: dark)")
                        .matches);
            return isDark ? t.dark : t.light;
        },
    },

    actions: {
        async load() {
            this.loading = true;
            try {
                const res = await axios.get(u("/api/admin/settings"));
                this.settings = res.data as AdminSettings;

                // TS2531-Fix: Null-Guard vor applyTheme
                if (this.settings) {
                    const { applyTheme } = useTheme();
                    applyTheme(this.settings.theme);
                }
            } finally {
                this.loading = false;
            }
        },

        async save(partial: Partial<AdminSettings>) {
            const res = await axios.put(u("/api/admin/settings"), partial);
            this.settings = res.data as AdminSettings;

            // TS2531-Fix: Null-Guard oder optional chaining
            if (this.settings) {
                const { applyTheme } = useTheme();
                applyTheme(this.settings.theme);
            }

            return this.settings;
        },

        applyThemeNow() {
            // TS2531-Fix: Null-Guard
            if (!this.settings) return;
            const { applyTheme } = useTheme();
            applyTheme(this.settings.theme);
        },
    },
});
