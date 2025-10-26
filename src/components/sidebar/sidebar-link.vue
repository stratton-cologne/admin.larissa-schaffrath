<!-- src/components/sidebar/sidebar-link.vue -->
<template>
    <RouterLink :to="to" class="group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors"
        :class="isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-primary/5 hover:text-primary'">
        <!-- Wrapper übernimmt Klassen/A11y; Icon bekommt nur den Namen -->
        <span v-if="icon" class="h-5 w-5 shrink-0 inline-flex items-center justify-center" aria-hidden="true">
            <UiIcon :name="icon" />
        </span>

        <span class="truncate">{{ label }}</span>
    </RouterLink>
</template>

<script setup lang="ts">
/**
 * @file sidebar-link.vue
 * @brief Ein einzelner Sidebar-Navigationslink mit optionalem Icon.
 * @details
 *  - Hebt den aktiven Link basierend auf `route.path === to` hervor.
 *  - Kompakte, zugängliche Darstellung mit Truncation.
 */

import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Icon as UiIcon } from '@stratton-cologne/ui'

/* ============================================================================
 * Props
 * ==========================================================================*/

/**
 * @brief Zielroute, Label und optionales Icon.
 */
const props = defineProps<{
    /** @brief Zielpfad (muss mit `route.path` vergleichbar sein). */
    to: string
    /** @brief Sichtbarer Text des Links. */
    label: string
    /** @brief Optionaler Icon-Name für `<UiIcon>`. */
    icon?: string
}>()

/* ============================================================================
 * State & Computed
 * ==========================================================================*/

const route = useRoute()

/**
 * @brief Aktivitätsstatus des Links.
 * @details Exakter Pfadvergleich; für komplexere Fälle ggf. auf `startsWith`
 *          oder `route.name`/`route.matched` umstellen.
 */
const isActive = computed<boolean>(() => route.path === props.to)
</script>
