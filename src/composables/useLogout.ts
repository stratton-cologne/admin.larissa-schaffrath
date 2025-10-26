/**
 * @file useLogout.ts
 * @brief Composable zum Abmelden des Nutzers inkl. Toast und Redirect.
 * @details
 *  - Versucht bevorzugt den Store-Logout (Side-Effects/Server-Logout).
 *  - Fallback: entfernt ein lokales Token aus localStorage.
 *  - Zeigt Status-Toasts und leitet zur SignIn-Route weiter.
 */

import { useRouter } from "vue-router";
import { useToast } from "@stratton-cologne/vue-smart-toast";
import { useAuthStore } from "@/stores/auth";

/**
 * @brief Stellt eine Logout-Funktion bereit.
 * @returns Objekt mit der asynchronen `logout`-Funktion.
 */
export function useLogout() {
    const router = useRouter();
    const { showToast } = useToast();
    const auth = useAuthStore();

    /**
     * @brief Meldet den aktuellen Benutzer ab.
     * @details
     *  - Ruft `auth.logout()` auf, wenn vorhanden.
     *  - Fällt andernfalls auf das Entfernen eines lokalen Tokens zurück.
     *  - Zeigt Erfolg/Fehler per Toast und navigiert anschließend zur SignIn-Seite.
     */
    async function logout(): Promise<void> {
        try {
            // Bevorzugt: Logout über den Auth-Store
            if (auth && typeof auth.logout === "function") {
                await auth.logout();
            } else {
                // Fallback: lokales Token entfernen
                try {
                    window.localStorage.removeItem("token");
                } catch {
                    // Ignorieren: localStorage evtl. nicht verfügbar
                }
            }

            showToast({
                key: "logout-success",
                message: "Erfolgreich abgemeldet",
                type: "success",
                duration: 2200,
                position: "top-right",
            });

            await router.push({ name: "SignIn" });
        } catch {
            showToast({
                key: "logout-error",
                message: "Abmelden fehlgeschlagen",
                type: "error",
                duration: 3000,
                position: "top-right",
            });
        }
    }

    return { logout };
}
