<!-- src/components/sidebar/sidebar-section.vue -->
<template>
    <nav class="space-y-5 w-full">
        <section v-for="g in groups" :key="g.section">
            <!-- Header: Name + Chevron -->
            <button type="button"
                class="flex w-full min-w-56 items-start justify-between px-3 py-1.5 rounded-lg hover:bg-primary/5"
                @click="toggleGroup(g.section)">
                <h6 class="text-xs uppercase tracking-wide text-muted select-none truncate">
                    {{ g.section }}
                </h6>
                <span class="h-4 w-4 inline-flex items-center justify-center opacity-70" aria-hidden="true">
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
 */

import { onMounted, ref, watch } from 'vue'
import { Icon as UiIcon } from '@stratton-cologne/ui'
import SidebarLink from './sidebar-link.vue'

/* ============================================================================
 * Typen
 * ==========================================================================*/

/** @brief Ein Link-Eintrag innerhalb einer Gruppe. */
type GroupItem = {
    path: string
    title: string
    icon?: string
    order: number
    sectionOrder: number
}

/** @brief Zusammengefasste Gruppe (Section) mit Items. */
type Group = {
    section: string
    sectionOrder: number
    items: GroupItem[]
}

/* ============================================================================
 * Props
 * ==========================================================================*/

/**
 * @brief Erwartet die bereits gruppierten Sidebar-Daten.
 */
const props = defineProps<{ groups: Group[] }>()

/* ============================================================================
 * Konstanten & State
 * ==========================================================================*/

/** @brief Persistenzschlüssel für offene Gruppen. */
const STORAGE_KEY = 'sc:sidebar:openGroups'

/** @brief Set der offenen Gruppen (Sections). */
const openGroups = ref<Set<string>>(new Set())

/** @brief Wurde bereits aus Persistenz initialisiert? */
const initializedFromPersist = ref(false)

/** @brief Vorherige Menge der Sections (zum Erkennen neuer/entfallener Gruppen). */
const prevSections = ref<Set<string>>(new Set())

/* ============================================================================
 * Funktionen
 * ==========================================================================*/

/**
 * @brief Lädt den persistierten Set offener Gruppen.
 * @returns Set der Section-Namen.
 */
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

/**
 * @brief Persistiert den aktuellen Zustand offener Gruppen.
 */
function persist(): void {
    try {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(openGroups.value)))
    } catch {
        /* noop */
    }
}

/**
 * @brief Prüft, ob eine Section geöffnet ist.
 * @param section Name der Section.
 */
function isGroupOpen(section: string): boolean {
    return openGroups.value.has(section)
}

/**
 * @brief Toggle für eine Section (öffnet/schließt und persistiert).
 * @param section Name der Section.
 */
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

/**
 * @brief Initialisiert offene Gruppen aus Persistenz oder öffnet alle.
 */
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

/**
 * @brief Reagiert auf Änderungen der Gruppenliste.
 * @details
 *  - Entfernt nicht mehr existierende Sections aus `openGroups`.
 *  - Fügt nur wirklich neue Sections hinzu (Default: offen).
 *  - Bereits bewusst geschlossene bleiben geschlossen.
 */
watch(
    () => props.groups.map((g) => g.section),
    (sectionsArr) => {
        const sections = new Set(sectionsArr)
        const next = new Set(openGroups.value)
        let changed = false

        // Entferne, was es nicht mehr gibt
        for (const s of Array.from(next)) {
            if (!sections.has(s)) {
                next.delete(s)
                changed = true
            }
        }

        // Nur wirklich neue Sektionen hinzufügen (default: offen)
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

        // prev aktualisieren
        prevSections.value = sections
    },
    { immediate: false }
)
</script>
