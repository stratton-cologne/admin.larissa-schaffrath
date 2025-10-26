// src/lib/env.ts
type Boolish = boolean | "true" | "false" | "1" | "0" | undefined;

function toBool(v: Boolish, fallback = false): boolean {
    if (v === true || v === "true" || v === "1") return true;
    if (v === false || v === "false" || v === "0") return false;
    return fallback;
}

function required(name: string, value: string | undefined): string {
    if (!value || !value.trim()) {
        // Hard fail im Dev; im Prod lieber sauber loggen
        throw new Error(`[env] Missing required variable: ${name}`);
    }
    return value;
}

export const isDev = import.meta.env.DEV;

export const env = {
    apiBaseUrl: required(
        "VITE_API_BASE_URL",
        import.meta.env.VITE_API_BASE_URL,
    ),
    defaultRoles:
        (import.meta.env.VITE_DEFAULT_ROLES as string | undefined)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) ?? [],
    featureReports: toBool(import.meta.env.VITE_FEATURE_REPORTS, true),
    featureUsers: toBool(import.meta.env.VITE_FEATURE_USERS, true),
} as const;
