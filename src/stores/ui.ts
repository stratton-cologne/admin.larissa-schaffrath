/**
 * @file ui.ts
 * @brief UI-Store für globale UI-Zustände (Sidebar etc.).
 * @details
 *  - Persistiert den Sidebar-Status in localStorage.
 *  - Bietet Helper zum automatischen Schließen auf schmalen Screens.
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";

/** @brief localStorage-Schlüssel für den Sidebar-Zustand. */
const STORAGE_KEY = "ui.sidebarOpen";

/**
 * @brief UI-Store: steuert u. a. die Sidebar.
 * @returns Öffentliche State/Actions des UI-Stores.
 */
export const useUiStore = defineStore("ui", () => {
    /** @brief Sichtbarkeit der Sidebar. */
    const sidebarOpen = ref<boolean>(false);

    /**
     * @brief Initialisiere Sidebar-Status aus localStorage.
     * @note SSR-sicher: greift nur zu, wenn `window` vorhanden ist.
     */
    try {
        if (typeof window !== "undefined") {
            const persisted = window.localStorage.getItem(STORAGE_KEY);
            if (persisted !== null) sidebarOpen.value = persisted === "true";
        }
    } catch {
        // Ignorieren: Zugriff auf localStorage kann in privaten Modi/SSR fehlschlagen.
    }

    /** @brief Öffnet die Sidebar. */
    const openSidebar = (): void => {
        sidebarOpen.value = true;
    };

    /** @brief Schließt die Sidebar. */
    const closeSidebar = (): void => {
        sidebarOpen.value = false;
    };

    /** @brief Toggle für die Sidebar. */
    const toggleSidebar = (): void => {
        sidebarOpen.value = !sidebarOpen.value;
    };

    /**
     * @brief Persistiert den Sidebar-Status.
     * @note Fehler werden still ignoriert (Quota/Privacy/SSR).
     */
    watch(
        sidebarOpen,
        (v) => {
            try {
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(STORAGE_KEY, String(v));
                }
            } catch {
                // still ignore
            }
        },
        { flush: "post" },
    );

    /**
     * @brief Schliesst die Sidebar automatisch auf schmalen Screens.
     * @details Bricht leise ab, wenn `matchMedia` nicht verfügbar ist.
     */
    const closeOnMobile = (): void => {
        try {
            if (
                typeof window !== "undefined" &&
                typeof window.matchMedia === "function" &&
                window.matchMedia("(max-width: 1279px)").matches
            ) {
                closeSidebar();
            }
        } catch {
            // still ignore
        }
    };

    return {
        // state
        sidebarOpen,
        // actions
        openSidebar,
        closeSidebar,
        toggleSidebar,
        closeOnMobile,
    };
});
