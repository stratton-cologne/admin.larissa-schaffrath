// frontend/src/utils/jwt.ts
export type JwtPayload = { exp?: number; iat?: number; [k: string]: unknown };

function base64UrlToString(b64url: string): string {
    // Base64URL → Base64 mit Padding
    const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
    const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
    // atob ist in Browsern vorhanden (DOM lib); fallback brauchst du hier i. d. R. nicht
    return atob(b64);
}

export function decodeJwt(token?: string | null): JwtPayload | null {
    try {
        if (!token) return null;
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payloadPart = parts[1];
        if (!payloadPart) return null;

        const binary = base64UrlToString(payloadPart);
        // Binär → UTF-8 String
        const jsonStr = decodeURIComponent(
            Array.from(binary)
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join(""),
        );
        const obj = JSON.parse(jsonStr);
        return obj && typeof obj === "object" ? (obj as JwtPayload) : null;
    } catch {
        return null;
    }
}
