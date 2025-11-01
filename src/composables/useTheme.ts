// src/composables/useTheme.ts
import { onBeforeUnmount, getCurrentInstance } from "vue";

/** ---------- Typen ---------- */
export type ThemeBranch = {
    primary: string;
    text: string;
    background: string;

    accent: string;
    accentText: string;
    accentBackground: string;

    sidebarBackground: string;
    sidebarText: string;

    navBackground: string;
    navText: string;
};

export type ThemePayload = {
    mode: "system" | "light" | "dark";
    light: ThemeBranch;
    dark: ThemeBranch;
};

/** ---------- Farb-/Parsing-Utils ---------- */

type RGBA = { r: number; g: number; b: number; a: number };
type HSLA = { h: number; s: number; l: number; a: number };
type Shade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Scale = Record<Shade, string>;

const THEME_STYLE_ID = "app-theme-vars";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clamp255 = (v: number) => Math.min(255, Math.max(0, Math.round(v)));

function parseHex(hex: string): RGBA | null {
    const h = (hex ?? "").replace(/^#/, "").trim();
    if (![3, 4, 6, 8].includes(h.length)) return null;
    const to255 = (s: string) => parseInt(s, 16);

    if (h.length === 3 || h.length === 4) {
        const rCh = h.charAt(0) || "0";
        const gCh = h.charAt(1) || "0";
        const bCh = h.charAt(2) || "0";
        const aCh = h.charAt(3);
        const r = to255(rCh + rCh);
        const g = to255(gCh + gCh);
        const b = to255(bCh + bCh);
        const a = aCh ? to255(aCh + aCh) / 255 : 1;
        return { r, g, b, a };
    }

    const r = to255(h.slice(0, 2));
    const g = to255(h.slice(2, 4));
    const b = to255(h.slice(4, 6));
    const a = h.length === 8 ? to255(h.slice(6, 8)) / 255 : 1;
    return { r, g, b, a };
}

function parseRgb(css: string): RGBA | null {
    const s = (css ?? "").trim().toLowerCase();
    const m = s.match(
        /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/,
    );
    if (!m) return null;
    const r = clamp255(parseInt(m[1] ?? "0", 10));
    const g = clamp255(parseInt(m[2] ?? "0", 10));
    const b = clamp255(parseInt(m[3] ?? "0", 10));
    const a = m[4] != null ? clamp01(parseFloat(m[4])) : 1;
    return { r, g, b, a };
}

/** var(--token[, fallback]) → computed value (oder Fallback/Original) */
function resolveVarOrColor(value: string): string {
    const v = (value ?? "").trim();
    if (!v.startsWith("var(")) return v;

    const inside = v.slice(4, -1).trim();
    const parts = inside.split(",");
    const varName = (parts[0] ?? "").trim();
    const fb = (parts[1] ?? "").trim();

    if (!varName || !varName.startsWith("--")) return fb || v;
    if (typeof window === "undefined") return fb || v;

    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue(varName);
    const resolved = (raw ?? "").trim();
    return resolved || fb || v;
}

function toRgba(input: string): RGBA | null {
    const s = resolveVarOrColor(input);
    if (!s) return null;
    if (s.startsWith("#")) return parseHex(s);
    if (s.startsWith("rgb")) return parseRgb(s);
    return null;
}

function rgbToHsl({ r, g, b, a }: RGBA): HSLA {
    const rn = r / 255,
        gn = g / 255,
        bn = b / 255;
    const max = Math.max(rn, gn, bn),
        min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d !== 0) {
        switch (max) {
            case rn:
                h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
                break;
            case gn:
                h = ((bn - rn) / d + 2) * 60;
                break;
            case bn:
                h = ((rn - gn) / d + 4) * 60;
                break;
        }
    }
    return { h, s, l, a };
}

function hslToRgb({ h, s, l, a }: HSLA): RGBA {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let rn = 0,
        gn = 0,
        bn = 0;

    if (0 <= h && h < 60) {
        rn = c;
        gn = x;
        bn = 0;
    } else if (60 <= h && h < 120) {
        rn = x;
        gn = c;
        bn = 0;
    } else if (120 <= h && h < 180) {
        rn = 0;
        gn = c;
        bn = x;
    } else if (180 <= h && h < 240) {
        rn = 0;
        gn = x;
        bn = c;
    } else if (240 <= h && h < 300) {
        rn = x;
        gn = 0;
        bn = c;
    } else {
        rn = c;
        gn = 0;
        bn = x;
    }

    return {
        r: clamp255((rn + m) * 255),
        g: clamp255((gn + m) * 255),
        b: clamp255((bn + m) * 255),
        a: clamp01(a),
    };
}

function rgbaToCss({ r, g, b, a }: RGBA): string {
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}

/** Skala -100 … -900 um -500 (Basis) */
function makeScale(baseCss: string): Scale {
    const baseIn = baseCss && baseCss.trim() ? baseCss : "#000000";
    const base = toRgba(baseIn);

    if (!base) {
        return {
            100: baseIn,
            200: baseIn,
            300: baseIn,
            400: baseIn,
            500: baseIn,
            600: baseIn,
            700: baseIn,
            800: baseIn,
            900: baseIn,
        };
    }

    const baseHsl = rgbToHsl(base);
    const STEP = 0.095; // 9.5%
    const out = {} as Scale;

    const compute = (offsetSteps: number) => {
        const hsl: HSLA = {
            h: baseHsl.h,
            s: baseHsl.s,
            l: clamp01(baseHsl.l + offsetSteps * STEP),
            a: baseHsl.a,
        };
        return rgbaToCss(hslToRgb(hsl));
    };

    out[500] = rgbaToCss(hslToRgb(baseHsl));
    out[400] = compute(+1);
    out[300] = compute(+2);
    out[200] = compute(+3);
    out[100] = compute(+4);
    out[600] = compute(-1);
    out[700] = compute(-2);
    out[800] = compute(-3);
    out[900] = compute(-4);

    return out;
}

/** ---------- Variablen als CSS-Text generieren & in <head> schreiben ---------- */

const COLOR_KEYS: (keyof ThemeBranch)[] = [
    "primary",
    "text",
    "background",
    "accent",
    "accentText",
    "accentBackground",
    "sidebarBackground",
    "sidebarText",
    "navBackground",
    "navText",
];

function toKebab(s: string) {
    return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Baut den :root-Block mit allen Variablen (inkl. -100…-900) */
function buildCssForBranch(branch: ThemeBranch): string {
    const lines: string[] = [];

    for (const key of COLOR_KEYS) {
        const raw = (branch as Record<string, string | undefined>)[key] ?? "";
        const value = String(raw);
        const scale = makeScale(value);

        const base = `--color-${toKebab(String(key))}`;
        lines.push(`${base}: ${scale[500]};`);
        lines.push(`${base}-100: ${scale[100]};`);
        lines.push(`${base}-200: ${scale[200]};`);
        lines.push(`${base}-300: ${scale[300]};`);
        lines.push(`${base}-400: ${scale[400]};`);
        lines.push(`${base}-500: ${scale[500]};`);
        lines.push(`${base}-600: ${scale[600]};`);
        lines.push(`${base}-700: ${scale[700]};`);
        lines.push(`${base}-800: ${scale[800]};`);
        lines.push(`${base}-900: ${scale[900]};`);
    }

    // Ein :root-Block, leicht lesbar formatiert
    return `:root{\n  ${lines.join("\n  ")}\n}`;
}

/** Sorgt dafür, dass (einmalig) <style id="app-theme-vars"> existiert */
function ensureStyleEl(): HTMLStyleElement | null {
    if (typeof document === "undefined") return null;
    let el = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
        el = document.createElement("style");
        el.id = THEME_STYLE_ID;
        // Hinweis: wenn du CSP Nonce nutzt, hier setzen (el.nonce = '...';)
        document.head.appendChild(el);
    }
    return el;
}

/** Schreibt die Variablen des übergebenen Branches in das Style-Tag */
function writeThemeVars(branch: ThemeBranch) {
    const el = ensureStyleEl();
    if (!el) return;
    el.textContent = buildCssForBranch(branch);
}

/** ---------- Dark-Class steuern ---------- */
function setDarkClass(on: boolean) {
    if (typeof document === "undefined") return;
    const r = document.documentElement;
    r.classList.toggle("dark", on);
    r.setAttribute("data-theme", on ? "dark" : "light");
}

/** ---------- Composable ---------- */
export function useTheme() {
    let mql: MediaQueryList | null = null;
    let mqlHandler: ((e: MediaQueryListEvent) => void) | null = null;
    let last: ThemePayload | null = null;

    function applySystem(branches: { light: ThemeBranch; dark: ThemeBranch }) {
        const prefersDark =
            typeof window !== "undefined" &&
            !!window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        setDarkClass(prefersDark);
        writeThemeVars(prefersDark ? branches.dark : branches.light);
    }

    function subscribeSystem(branches: {
        light: ThemeBranch;
        dark: ThemeBranch;
    }) {
        if (typeof window === "undefined" || !window.matchMedia) return;
        mql = window.matchMedia("(prefers-color-scheme: dark)");
        mqlHandler = (e) => {
            setDarkClass(e.matches);
            writeThemeVars(e.matches ? branches.dark : branches.light);
        };
        mql.addEventListener("change", mqlHandler);
    }

    function unsubscribeSystem() {
        if (mql && mqlHandler) {
            mql.removeEventListener("change", mqlHandler);
        }
        mql = null;
        mqlHandler = null;
    }

    function applyTheme(payload: ThemePayload) {
        last = payload;
        unsubscribeSystem();

        if (payload.mode === "system") {
            applySystem(payload);
            subscribeSystem(payload);
            return;
        }

        const isDark = payload.mode === "dark";
        setDarkClass(isDark);
        writeThemeVars(isDark ? payload.dark : payload.light);
    }

    // Lifecycle nur, wenn im Komponenten-Kontext
    if (getCurrentInstance()) {
        onBeforeUnmount(() => {
            unsubscribeSystem();
        });
    }

    function reapply() {
        if (last) applyTheme(last);
    }

    return { applyTheme, reapply };
}
