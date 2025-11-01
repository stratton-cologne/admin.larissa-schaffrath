<!-- src/components/sidebar/Sidebar.vue -->
<template>
    <!-- Overlay für mobile, klick → schließt -->
    <div class="fixed inset-0 z-989 bg-black/20 xl:hidden transition-opacity" v-show="ui.sidebarOpen"
        @click="ui.closeSidebar()"></div>

    <aside class="ease-nav-brand z-990 fixed inset-y-0 my-4 ml-4 w-[calc(100%-2rem)] max-w-56
               flex-wrap items-start justify-between rounded-2xl border border-sidebar-background-800 bg-sidebar-background p-0 antialiased shadow-none
               transition-transform duration-200 flex flex-col overflow-x-hidden" :class="[
                // mobil: vom Store gesteuert
                ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                // ab xl immer sichtbar
                'xl:left-0 xl:translate-x-0'
            ]" @keydown.esc="ui.closeSidebar()">
        <!-- Brand -->
        <div class="px-4 py-2 border-b border-muted/20">
            <RouterLink class=" m-0 whitespace-nowrap px-0 py-1 text-sm text-primary! font-bold" :to="brandTo"
                :class="logoSrc ? 'flex flex-nowrap flex-row items-center gap-x-2' : 'block'">
                <img v-if="logoSrc" :src="logoSrc" alt="main_logo"
                    class="inline h-full max-h-8 max-w-full transition-all duration-200 ease-nav-brand" />
                <span class="truncate font-display text-lg">{{ brandName }}</span>
            </RouterLink>
        </div>

        <!-- Sections -->
        <div class="w-full flex-1 overflow-auto px-2 py-4">
            <SidebarSection :groups="groups" />
        </div>

        <!-- Logout (Footer) -->
        <div class="border-t border-primary-300 w-full mt-auto" v-if="showHelpCard || showCta">
            <button type="button" @click="logout" class="w-full inline-flex items-center gap-2 rounded-2xl px-3 text-sm transition-colors
                       text-muted hover:bg-primary/40 hover:text-text">
                <span class="h-5 w-5 inline-flex items-center justify-center" aria-hidden="true">
                    <UiIcon name="user" />
                </span>
                <span>Abmelden</span>
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
/**
 * @file Sidebar.vue
 * @brief Responsives Seitenmenü mit Brand, Navigationsgruppen und Logout.
 * @details
 *  - Mobile Overlay mit Schließen per Klick/ESC.
 *  - Navigationsgruppen werden über ein Composable bereitgestellt.
 *  - Sichtbarkeit wird zentral über den UI-Store gesteuert.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/** Externes UI-Kit (Icons) */
import { Icon as UiIcon } from '@stratton-cologne/ui'

/** Lokale Komponenten */
import SidebarSection from '@/components/sidebar/sidebar-section.vue'

/** Stores */
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

/** Composables */
import { useLogout } from '@/composables/useLogout'
import { useSidebarNav } from '@/composables/useSidebarNav'

/**
 * @typedef {Object} SidebarProps
 * @property {string} [logoSrc]        - Pfad/URL zum Brand-Logo (optional).
 * @property {string} [brandName]      - Anzeigename der App in der Sidebar.
 * @property {string} [brandTo]        - Router-Ziel der Brand-Verlinkung.
 * @property {boolean} [showSectionTitles] - Überschriften in den Sections anzeigen.
 * @property {boolean} [showHelpCard]  - Optionaler Footerbereich (Hilfe).
 * @property {boolean} [showCta]       - Optionaler Footerbereich (CTA).
 */

/** @brief Eingangs-Props mit Defaults. */
const props = withDefaults(defineProps<{
    logoSrc?: string
    brandName?: string
    brandTo?: string
    showSectionTitles?: boolean
    showHelpCard?: boolean
    showCta?: boolean
}>(), {
    brandName: import.meta.env.VITE_APP_TITLE || 'Brand Name',
    brandTo: '/',
    showSectionTitles: true,
    showHelpCard: false,
    showCta: false,
})

/** @brief Stores initialisieren. */
const auth = useAuthStore()
const ui = useUiStore()

/** @brief Logout-Aktion über Composable. */
const { logout } = useLogout()

/** @brief Navigationsgruppen aus Composable beziehen. */
const { groups } = useSidebarNav()

/** @brief Abgeleitete Werte für Brand. */
const brandName = computed(() => props.brandName)
const logoSrc = computed(() => props.logoSrc)

/**
 * @brief Anzeigename des eingeloggten Nutzers.
 * @returns {string} Name/Username oder Fallback "Profil".
 */
const displayName = computed(() => {
    const u = auth.user as any
    return u?.name || u?.username || 'Profil'
})
</script>
