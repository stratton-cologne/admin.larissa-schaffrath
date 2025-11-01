<!-- src/components/sidebar/sidebar-section.vue -->
<template>
    <nav class="space-y-5 w-full">
        <section v-for="g in groups" :key="g.section" class="min-w-0">
            <!-- Header: Name + Chevron -->
            <button type="button"
                class="flex w-full min-w-0 items-center justify-between justify-items-center px-4 py-1 rounded-lg"
                @click="toggleGroup(g.section)">
                <!-- Truncate sorgt dafür, dass lange Sektionsnamen den Chevron nicht überdecken -->
                <h6 class="text-xs uppercase tracking-wide text-text! select-none truncate mb-0">
                    {{ g.section }}
                </h6>
                <span class="h-4 w-4 inline-flex items-center justify-center opacity-70 shrink-0" aria-hidden="true">
                    <UiIcon :name="isGroupOpen(g.section) ? 'chevron-up' : 'chevron-down'" />
                </span>
            </button>

            <!-- Items: v-show verhindert Re-Mounts / Truncate verhindert Breiten-Sprünge -->
            <div v-show="isGroupOpen(g.section)" class="mt-2 space-y-1 w-full">
                <SidebarLink v-for="item in g.items" :key="item.path" :to="item.path" :label="item.title"
                    :icon="item.icon" />
            </div>
        </section>
    </nav>
</template>

<script setup lang="ts">
/**
 * @file sidebar-section.vue
 * @brief Akkordeon-artige Anzeige von Sidebar-Gruppen und -Links.
 * @details
 *  - Offene Gruppen werden in localStorage persistiert.
 *  - Neue Gruppen öffnen standardmäßig; entfernte werden bereinigt.
 *  - `v-show` verhindert Remounts der Items beim Auf-/Zuklappen.
 *  - Einheitliche Innenabstände: Die umgebende Sidebar vergibt `px-4`;
 *    Buttons/Links haben identische eigene Innenabstände (px-4),
 *    wodurch links/rechts visuell gleich bleiben.
 */

import { onMounted, ref, watch } from 'vue'
import { Icon as UiIcon } from '@stratton-cologne/ui'
import SidebarLink from './sidebar-link.vue'

/* ============================================================================
 * Typen
 * ==========================================================================*/

type GroupItem = {
    path: string
    title: string
    icon?: string
    order: number
    sectionOrder: number
}

type Group = {
    section: string
    sectionOrder: number
    items: GroupItem[]
}

/* ============================================================================
 * Props
 * ==========================================================================*/
const props = defineProps<{ groups: Group[] }>()
/* ============================================================================
 * Konstanten & State
 * ==========================================================================*/
const STORAGE_KEY = 'sc:sidebar:openGroups'
const openGroups = ref<Set<string>>(new Set())
const initializedFromPersist = ref(false)
const prevSections = ref<Set<string>>(new Set())

/* ============================================================================
 * Funktionen
 * ==========================================================================*/
function loadPersisted(): Set<string> {
    try {
        if (typeof window === 'undefined') return new Set<string>()
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return new Set<string>()
        const arr = JSON.parse(raw)
        return Array.isArray(arr) ? new Set<string>(arr) : new Set<string>()
    } catch {
        return new Set<string>()
    }
}

function persist(): void {
    try {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(openGroups.value)))
    } catch {
        /* noop */
    }
}

function isGroupOpen(section: string): boolean {
    return openGroups.value.has(section)
}

function toggleGroup(section: string): void {
    const next = new Set(openGroups.value)
    if (next.has(section)) next.delete(section)
    else next.add(section)
    openGroups.value = next
    persist()
}

/* ============================================================================
 * Lifecycle
 * ==========================================================================*/
onMounted(() => {
    const persisted = loadPersisted()
    if (persisted.size) {
        openGroups.value = persisted
    } else {
        const all = new Set(props.groups.map((g) => g.section))
        openGroups.value = all
        persist()
    }
    initializedFromPersist.value = true
    prevSections.value = new Set(props.groups.map((g) => g.section))
})

/* ============================================================================
 * Watcher
 * ==========================================================================*/
watch(
    () => props.groups.map((g) => g.section),
    (sectionsArr) => {
        const sections = new Set(sectionsArr)
        const next = new Set(openGroups.value)
        let changed = false

        // Entferne nicht mehr existierende Sections
        for (const s of Array.from(next)) {
            if (!sections.has(s)) {
                next.delete(s)
                changed = true
            }
        }

        // Neue Sections (Default: offen) hinzufügen
        const previously = prevSections.value
        for (const s of sections) {
            const isNew = !previously.has(s)
            if (isNew && !next.has(s)) {
                next.add(s)
                changed = true
            }
        }

        if (changed) {
            openGroups.value = next
            persist()
        }

        prevSections.value = sections
    },
    { immediate: false }
)
</script>
