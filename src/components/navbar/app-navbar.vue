<!-- src/components/nav/app-navbar.vue -->
<template>
    <nav
        class="relative mx-6 my-4 rounded-2xl px-0 py-0 transition-all duration-250 ease-soft-in shadow-none lg:flex-nowrap lg:justify-start bg-nav-background border border-nav-background-800">
        <div class="flex w-full flex-wrap items-center justify-between px-4 py-1">
            <!-- Breadcrumbs + Page Title -->
            <ScBreadcrumb :from-router="false" :items="breadcrumbItems" aria-label="Breadcrumb" separator="/" />

            <!-- Right cluster -->
            <div class="mt-2 flex grow items-center sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto ">
                <!-- Right actions -->
                <ul class="mb-0 flex w-full flex-wrap items-center lg:justify-end gap-1 pl-0 lg:w-auto justify-between">
                    <!-- Search e) -->
                    <li class="order-1 flex items-center pl-0 flex-1 min-w-[50%] lg:order-0 lg:flex-none lg:min-w-0">
                        <ScSearch v-model="search" :placeholder="placeholder" :manual="true"
                            :filters="{ user: ['user', 'u'], status: ['status', 'st'], order: ['order', 'ord', '#'] }"
                            @search="$emit('search', search)" />
                    </li>
                    <!-- Burger (mobile) -->
                    <li class="order-1 xl:hidden flex items-center pl-2 lg:order-0">
                        <ScButton variant="ghost" tone="neutral" size="sm" class="rounded-2xl px-2 py-2"
                            aria-label="Open sidenav" @click="$emit('toggle-sidenav')">
                            <template #prefix>
                                <UiIcon name="menu" class="h-5 w-5" aria-hidden="true" />
                            </template>
                            <span class="sr-only">Open sidenav</span>
                        </ScButton>
                    </li>

                    <li class="order-2 basis-full h-0 lg:hidden"></li>

                    <!-- Notifications -->
                    <li class="order-3 lg:order-0">
                        <ScDropdown placement="bottom-end" :close-on-outside="true" :close-on-item-click="true"
                            @select="onSelectNotification">
                            <!-- Trigger -->
                            <template #trigger="{ toggle }">
                                <ScButton variant="ghost" tone="neutral" size="sm"
                                    class="rounded-2xl px-2 py-2 relative" aria-label="Open notifications"
                                    @click.stop="toggle">
                                    <template #prefix>
                                        <!-- Todo: Replace with Bell Icon -->
                                        <UiIcon name="globe" class="h-5 w-5" aria-hidden="true" />
                                    </template>
                                    <span class="sr-only">Notifications</span>

                                    <!-- Unread Badge -->
                                    <span v-if="unreadCount > 0" class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center
                 h-4 min-w-4 px-1 rounded-full text-[10px] font-medium
                 bg-red-500 text-white leading-none" aria-hidden="true">
                                        {{ unreadCount > 9 ? '9+' : unreadCount }}
                                    </span>
                                </ScButton>
                            </template>

                            <!-- Panel -->
                            <div
                                class="min-w-72 max-w-sm rounded-xl border border-accent-background-800 bg-accent-background shadow-lg p-1">
                                <div v-if="!notifications?.length" class="px-3 py-6 text-sm text-muted text-center">
                                    Keine Benachrichtigungen
                                </div>

                                <button v-for="(n, i) in normalizedNotifications" :key="n.id ?? i" type="button"
                                    class="w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left text-sm hover:bg-primary/5"
                                    data-dropdown-item :data-value="String(n.id ?? i)">
                                    <span class="mt-0.5 h-5 w-5 inline-flex items-center justify-center opacity-80"
                                        aria-hidden="true">
                                        <UiIcon :name="n.icon || 'bell'" />
                                    </span>

                                    <span class="min-w-0 grow flex flex-col">
                                        <span class="font-medium text-text-800 truncate">
                                            {{ n.title }}
                                            <span v-if="n.unread"
                                                class="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 align-middle"></span>
                                        </span>
                                        <span v-if="n.message" class="text-text-600 truncate">{{ n.message }}</span>
                                    </span>

                                    <span v-if="n.time" class="ml-2 shrink-0 text-xs text-muted">{{ n.time }}</span>
                                </button>

                                <div v-if="notifications?.length" class="my-1 h-px bg-muted/20"></div>

                                <!-- Optional Footer -->
                                <div v-if="notifications?.length" class="px-1 py-1">
                                    <ScButton variant="link" tone="neutral" size="sm" class="w-full justify-center">
                                        Alle Benachrichtigungen ansehen
                                    </ScButton>
                                </div>
                            </div>
                        </ScDropdown>
                    </li>

                    <!-- Session countdown -->
                    <li class="order-3 pl-2 lg:order-0">
                        <SessionCountdown />
                    </li>

                    <!-- Profile / Account Dropdown -->
                    <li class="order-3 pl-2 lg:order-0">
                        <ScDropdown placement="bottom-end" :close-on-outside="true" :close-on-item-click="true"
                            @select="onSelect">
                            <!-- Trigger -->
                            <template #trigger="{ toggle }">
                                <button type="button" @click.stop="toggle"
                                    class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-primary/5"
                                    :aria-expanded="undefined" aria-haspopup="menu">
                                    <!-- Avatar: Initialen -->
                                    <span
                                        class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                                        aria-hidden="true">
                                        {{ initials }}
                                    </span>

                                    <!-- Name -->
                                    <span class="hidden sm:inline max-w-[14ch] truncate">{{ displayName }}</span>

                                    <!-- Caret -->
                                    <span class="h-4 w-4 inline-flex items-center justify-center opacity-60"
                                        aria-hidden="true">
                                        <UiIcon name="chevron-down" />
                                    </span>
                                </button>
                            </template>

                            <!-- Panel -->
                            <div
                                class="min-w-60 rounded-xl border border-accent-background-800 bg-accent-background shadow-lg p-1">
                                <!-- Header -->
                                <div class="px-3 py-2 text-xs text-muted border-b border-muted/20">
                                    <div class="font-bold text-sm text-primary">{{ displayName }}</div>
                                    <div class="truncate">{{ displayEmail }}</div>
                                </div>

                                <!-- Items -->
                                <button type="button"
                                    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-primary/5"
                                    data-dropdown-item data-value="settings">
                                    <span class="h-4 w-4 inline-flex items-center justify-center opacity-80"
                                        aria-hidden="true">
                                        <UiIcon name="settings" />
                                    </span>
                                    <span>Einstellungen</span>
                                </button>

                                <button type="button"
                                    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-primary/5"
                                    data-dropdown-item data-value="dashboard">
                                    <span class="h-4 w-4 inline-flex items-center justify-center opacity-80"
                                        aria-hidden="true">
                                        <UiIcon name="home" />
                                    </span>
                                    <span>Dashboard</span>
                                </button>

                                <div class="my-1 h-px bg-muted/20"></div>

                                <button type="button"
                                    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-primary/5 text-red-600"
                                    data-dropdown-item data-value="logout">
                                    <span class="h-4 w-4 inline-flex items-center justify-center opacity-80"
                                        aria-hidden="true">
                                        <UiIcon name="logout" />
                                    </span>
                                    <span>Abmelden</span>
                                </button>
                            </div>
                        </ScDropdown>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
/**
 * @file app-navbar.vue
 * @brief Top-Navigation mit Breadcrumbs, Suche, Session-Info und Account-Menü.
 * @details
 *  - Emittiert Events für Sidenav-Toggle, Einstellungen, Suche und Notification-Auswahl.
 *  - Zeigt Nutzerinfos aus dem Auth-Store (Name, E-Mail, Initialen).
 */
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/** UI-Bausteine */
import SessionCountdown from './session-countdown.vue'

/** UI-Kit */
import { Button as ScButton, Dropdown as ScDropdown, Icon as UiIcon, Breadcrumb as ScBreadcrumb, SearchField as ScSearch } from '@stratton-cologne/ui'

/** Stores & Composables */
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/composables/useLogout'

/* ============================================================================
 * Typen
 * ==========================================================================*/
type UiCrumb = { label: string; path?: string }

type NotificationItem = {
    id: string | number
    title: string
    message?: string
    time?: string
    unread?: boolean
    to?: any
    href?: string
    icon?: string        // optional: eigener Icon-Name
    tone?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

/* ============================================================================
 * Props & Emits (rootLabel/homeTo bleiben, sind aber für ScBreadcrumb nicht nötig)
 * ==========================================================================*/
const props = withDefaults(defineProps<{
    rootLabel?: string
    homeTo?: string
    placeholder?: string
    signInTo?: string
    signInLabel?: string
    notifications?: NotificationItem[]
}>(), {
    rootLabel: 'Pages',
    homeTo: '/',
    placeholder: 'Type here...',
    signInTo: '/auth/sign-in',
    signInLabel: 'Sign In',
    notifications: () => ([
        {
            id: 101,
            title: 'Neue Bestellung eingegangen',
            message: '#SO-48391 von Max Mustermann',
            time: 'vor 2 Min.',
            unread: true,
            icon: 'shopping-cart',
            tone: 'info',
            to: { name: 'OrdersDetail', params: { id: 48391 } }
        },
        {
            id: 102,
            title: 'Server-Backup erfolgreich',
            message: 'Backup 2025-10-27 03:00',
            time: 'vor 1 Std.',
            unread: true,
            icon: 'database',
            tone: 'success'
        },
        {
            id: 103,
            title: 'Zahlung fehlgeschlagen',
            message: 'Rechnung #INV-7742',
            time: 'vor 3 Std.',
            unread: false,
            icon: 'credit-card',
            tone: 'danger',
            to: { name: 'InvoiceDetail', params: { id: 7742 } }
        },
        {
            id: 104,
            title: 'Neuer Kommentar',
            message: '„Bitte um Rückruf…“',
            time: 'gestern',
            unread: false,
            icon: 'message-square',
            tone: 'neutral',
            href: 'https://example.com/tickets/991'
        },
        {
            id: 105,
            title: 'Deployment abgeschlossen',
            message: 'admin.larissa-schaffrath v1.2.3',
            time: 'gestern',
            unread: false,
            icon: 'rocket',
            tone: 'success'
        }
    ]),
})


defineEmits<{
    (e: 'toggle-sidenav'): void
    (e: 'open-settings'): void
    (e: 'search', q: string): void
    (e: 'select-notification', item: NotificationItem): void
}>()

/* ============================================================================
 * State & Stores
 * ==========================================================================*/
const router = useRouter()
const route = useRoute()
const search = ref('')

const auth = useAuthStore()
const { logout } = useLogout()

/* ============================================================================
 * Computed
 * ==========================================================================*/

/**
 * @brief Anzahl ungelesener Notifications.
 */
const unreadCount = computed(() => props.notifications.filter(n => n.unread).length)

const normalizedNotifications = computed<NotificationItem[]>(() => {
    return (props.notifications ?? []).map((raw, i) => {
        const any = raw as any
        const title =
            raw.title ?? any.label ?? any.subject ?? any.heading ?? any.text ?? any.message ?? ''
        const message =
            raw.message ?? any.description ?? any.body ?? any.content ?? any.excerpt ?? any.text ?? undefined
        const time =
            raw.time ?? any.ago ?? any.when ?? any.createdAt ?? any.created_at ?? undefined

        return {
            id: raw.id ?? i,
            title: title || '(Ohne Titel)',
            message,
            time,
            unread: raw.unread ?? any.isUnread ?? false,
            to: raw.to,
            href: raw.href,
            icon: raw.icon ?? any.type ?? 'globe',
            tone: raw.tone ?? 'neutral',
        }
    })
})
/**
 * Breadcrumb-Items für ScBreadcrumb.
 * Nutzt deine bestehende meta.breadcrumb: Array<{ label: string; to?: string }>
 */
const breadcrumbItems = computed<UiCrumb[]>(() => {
    const raw =
        (route.meta?.breadcrumb as Array<{ label: string; to?: string }> | undefined) ?? []

    // Fallbacks
    let lastLabel: string =
        raw.length > 0
            ? (raw[raw.length - 1]?.label ?? 'Dashboard')
            : (typeof route.name === 'string' ? route.name : 'Dashboard')

    let lastPath: string | undefined =
        raw.length > 0 ? raw[raw.length - 1]?.to ?? undefined : undefined

    const items: UiCrumb[] = [
        { label: props.rootLabel },          // "Pages"
        { label: lastLabel, path: lastPath } // "Dashboard"
    ]
    return items
})

const displayName = computed<string>(() => {
    const u = auth.user as any
    return u?.name || u?.username || 'Profil'
})

const displayEmail = computed<string>(() => {
    const u = auth.user as any
    return u?.email || ''
})

const initials = computed<string>(() => {
    const n = (displayName.value || '').trim()
    if (!n) return 'SC'
    const parts = n.split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const second = parts[1]?.[0] ?? ''
    return (first + second || first || 'SC').toUpperCase()
})

/* ============================================================================
 * Methods
 * ==========================================================================*/
function onSelect(val: unknown): void {
    switch (String(val)) {
        case 'settings':
            router.push({ name: 'Settings' })
            break
        case 'dashboard':
            router.push({ name: 'Dashboard' })
            break
        case 'logout':
            logout()
            break
    }
}

function onSelectNotification(val: unknown) {
    const key = String(val)
    const byId = props.notifications.find(n => String(n.id) === key)
    const byIdx = props.notifications[Number.isInteger(+key) ? +key : -1]
    const item = byId ?? byIdx ?? null
    if (item) {
        // vorhandenes Emit beibehalten
        // @ts-expect-error: emit ist oben via defineEmits registriert
        emit('select-notification', item)
    }
}

</script>

<style scoped>
/* Breadcrumb kompakt, dezent grau */
:deep(nav[data-component="sc-breadcrumb"]) {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    /* text-sm */
    line-height: 1.25rem;
    /* leading-5 */
    color: #94a3b8;
    /* slate-400 für "Pages" look */
    white-space: nowrap;
}

:deep(nav[data-component="sc-breadcrumb"] [data-role="list"]) {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0;
    list-style: none;
}

/* Items */
:deep(nav[data-component="sc-breadcrumb"] [data-role="item"]) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
}

/* Erstes (Pages) & Zwischenteile dezent grau */
:deep(nav[data-component="sc-breadcrumb"] [data-role="item"]:not([data-last="true"])) {
    /* color: #94a3b8; */
    color: var(--color-text-400);
    /* slate-400 */
}

/* Aktueller Eintrag: dunkel + semibold */
:deep(nav[data-component="sc-breadcrumb"] [data-role="item"][data-last="true"] [data-role="current"]) {
    /* color: #0f172a; */
    color: var(--color-text);
    /* slate-900 */
    font-weight: 600;
    /* semibold */
    max-width: 24ch;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Separator: Slash mit Luft links/rechts, leicht transparent */
:deep(nav[data-component="sc-breadcrumb"] [data-role="separator"]) {
    margin: 0 0.5rem;
    /* optische Spaces um "/" */
    opacity: 0.6;
    user-select: none;
}

/* Links (falls mal ein Crumb klickbar wäre) */
:deep(nav[data-component="sc-breadcrumb"] [data-role="link"]) {
    color: inherit;
    /* übernimmt grau */
    text-decoration: none;
    max-width: 16ch;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(nav[data-component="sc-breadcrumb"] [data-role="link"]:hover) {
    text-decoration: underline;
}

@media (max-width: 640px) {
    :deep(nav[data-component="sc-breadcrumb"] [data-role="link"]) {
        max-width: 12ch;
    }

    :deep(nav[data-component="sc-breadcrumb"] [data-role="current"]) {
        max-width: 16ch;
    }
}

/* Icon-only Buttons leicht kompakter wirken lassen */
:deep([data-component="sc-button"][data-variant="ghost"][data-size="sm"]) {
    --sc-btn-px: 0.5rem;
    --sc-btn-py: 0.5rem;
    border-radius: 1rem;
}

/* ===== SEARCH (sc-search) – Optik an Navbar angleichen ===== */
:deep([data-component="sc-search"]) {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    height: 2.25rem;
    /* ~ h-9 */
    padding: 0 .5rem;
    /* px-2 */
    border: 1px solid rgba(100, 116, 139, .2);
    /* slate-500/20 */
    border-radius: 1rem;
    /* rounded-2xl */
    background: #fff;
    transition: border-color .15s ease, box-shadow .15s ease;
}

:deep([data-component="sc-search"]:focus-within) {
    border-color: rgba(37, 99, 235, .4);
    /* primary/40 */
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .12);
}

/* Icon-Button links */
:deep([data-component="sc-search"] [data-role="submit"]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    /* w-7 */
    height: 1.75rem;
    /* h-7 */
    border-radius: .75rem;
    opacity: .85;
    transition: background-color .15s ease, opacity .15s ease;
}

:deep([data-component="sc-search"] [data-role="submit"]:hover) {
    background: rgba(15, 23, 42, .05);
    /* slate-900/5 */
    opacity: 1;
}

/* Eingabefeld */
:deep([data-component="sc-search"] [data-role="search"]) {
    border: 0;
    outline: none;
    font-size: .875rem;
    /* text-sm */
    line-height: 1.25rem;
    min-width: 12rem;
    /* ~ w-48 */
    padding: 0;
    /* wir nutzen Container-Padding */
    color: #0f172a;
    /* slate-900 */
}

:deep([data-component="sc-search"] [data-role="search"]::placeholder) {
    color: #94a3b8;
    /* slate-400 */
}

/* Dropdown (Optionen) */
:deep([data-component="sc-search"] [data-role="dropdown"]) {
    margin-top: .25rem;
    border: 1px solid rgba(100, 116, 139, .2);
    border-radius: .75rem;
    padding: .25rem;
    background: #fff;
    box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, .1),
        0 4px 6px -4px rgba(0, 0, 0, .1);
}

:deep([data-component="sc-search"] [data-role="option"]) {
    padding: .375rem .5rem;
    border-radius: .5rem;
    cursor: pointer;
    font-size: .875rem;
    display: flex;
    gap: .5rem;
}

:deep([data-component="sc-search"] [data-role="option"].is-highlighted),
:deep([data-component="sc-search"] [data-role="option"]:hover) {
    background: rgba(37, 99, 235, .06);
    /* primary/5-ish */
}

:deep([data-component="sc-search"] [data-role="option-meta"]) {
    color: #64748b;
    /* slate-500 */
    margin-left: .25rem;
}

/* Leerer Zustand */
:deep([data-component="sc-search"] [data-role="empty"]) {
    padding: .5rem .5rem;
    color: #64748b;
    font-size: .875rem;
}
</style>
