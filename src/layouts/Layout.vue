<!-- src/layouts/layout.vue -->
<template>
    <Notifications />

    <Sidebar v-if="!hideChrome" :logo-src="logoUrl" :brand-name="brandTitle" brand-to="/" :show-section-titles="true"
        :show-help-card="false" :show-cta="true" />

    <main
        class="ease-soft-in-out xl:ml-68.5 relative min-h-screen flex flex-col rounded-xl transition-all duration-200">
        <AppNavbar v-if="!hideChrome" @toggle-sidenav="ui.toggleSidebar()" @open-settings="openSettings = true"
            @search="onSearch" />
        <section class="main-content flex-1 min-h-0 overflow-auto">
            <RouterView />
        </section>
    </main>
</template>

<script setup lang="ts">
/**
 * @file app-layout.vue
 * @brief Hauptlayout mit Sidebar, Navbar, Benachrichtigungen und Router-Outlet.
 * @details
 *  - Blendt die Chrome (Sidebar + Navbar) auf Auth-/Hidden-Routen aus.
 *  - Bezieht Logo-URL und App-Titel aus `useLogoUrl`.
 *  - Lädt bei vorhandenem Token die Userdaten beim Mount.
 */

import { computed, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Notifications } from '@stratton-cologne/vue-smart-toast'

/** Layout-/UI-Komponenten */
import Sidebar from '@/components/sidebar/sidebar.vue'
import AppNavbar from '@/components/navbar/app-navbar.vue'

/** Stores */
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settingsStore'

/** Composables */
import { useLogoUrl } from '@/composables/useLogoUrl'

/* ============================================================================
 * Setup
 * ==========================================================================*/

const route = useRoute()
const authStore = useAuthStore()
const ui = useUiStore()

const { appTitle, logoUrl } = useLogoUrl()

const settings = useSettingsStore()

/**
 * Sidebar-Brand-Titel:
 * - wenn Admin-Settings geladen: settings.settings.title
 * - sonst Fallback: Env-Titel (useLogoUrl().appTitle)
 */
const brandTitle = computed(() => {
    const t = settings.settings?.title?.trim()
    return t && t.length ? t : appTitle
})

/**
 * @brief Steuert, ob die Chrome (Sidebar + Navbar) angezeigt wird.
 * @details
 *  - Versteckt bei Route `SignIn`.
 *  - Versteckt, wenn `meta.sidebar.hidden` und Section leer oder "Auth".
 */
const hideChrome = computed<boolean>(() => {
    if (route.name === 'SignIn') return true
    const s: any = route.meta?.sidebar
    if (s?.hidden && (s.section === 'Auth' || !s.section)) return true
    return false
})

/* ============================================================================
 * Navbar-Daten & UI-Zustände
 * ==========================================================================*/

/** @brief Öffnet das Settings-Panel (Platzhalter-State). */
const openSettings = ref(false)

/* ============================================================================
 * Events/Handler
 * ==========================================================================*/

/**
 * @brief Handler für die Suche in der Navbar.
 * @param q Suchbegriff.
 */
function onSearch(q: string): void {
    // TODO: Suche triggern
    // console.log('Search:', q)
}

/* ============================================================================
 * Lifecycle
 * ==========================================================================*/

/**
 * @brief Lädt bei vorhandenem Token die Userdaten.
 */
onMounted(async () => {
    if (authStore.token) {
        try {
            await authStore.fetchUser()
        } catch (error) {
            console.error('Failed to fetch user:', error)
        }
    }
})
</script>
