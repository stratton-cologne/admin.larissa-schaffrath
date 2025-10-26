<!-- src/layouts/app-layout.vue -->
<template>
    <Notifications />

    <Sidebar v-if="!hideChrome" :logo-src="logoUrl" :brand-name="appTitle" brand-to="/" :show-section-titles="true"
        :show-help-card="false" :show-cta="true" />

    <main
        class="ease-soft-in-out xl:ml-68.5 relative min-h-screen flex flex-col rounded-xl transition-all duration-200">
        <section class="main-content flex-1 min-h-0 overflow-auto">
            <RouterView />
        </section>
    </main>
</template>

<script setup lang="ts">
/**
 * @file app-layout.vue
 * @brief Hauptlayout mit Sidebar, Benachrichtigungen und Router-Outlet.
 * @details
 *  - Blendet die Chrome (Sidebar) auf Auth-/Hidden-Routen aus.
 *  - Bezieht Logo-URL und App-Titel aus `useLogoUrl`.
 */

import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Notifications } from '@stratton-cologne/vue-smart-toast'

/** Layout-Komponenten */
import Sidebar from '@/components/sidebar/sidebar.vue'

/** Stores */
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

/** Composables */
import { useLogoUrl } from '@/composables/useLogoUrl'

/* ============================================================================
 * Setup
 * ==========================================================================*/

const route = useRoute()
const authStore = useAuthStore()
const ui = useUiStore()

const { appTitle, logoUrl } = useLogoUrl()

/**
 * @brief Steuert, ob die Chrome (Sidebar) angezeigt wird.
 * @details
 *  - Versteckt bei `SignIn`.
 *  - Versteckt, wenn `meta.sidebar.hidden` und Section leer oder "Auth".
 */
const hideChrome = computed<boolean>(() => {
    if (route.name === 'SignIn') return true
    const s: any = route.meta?.sidebar
    if (s?.hidden && (s.section === 'Auth' || !s.section)) return true
    return false
})
</script>
