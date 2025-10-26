<template>
    <div class="layout">
        <!-- Header -->
        <header class="layout__header" role="banner">
            <div class="layout__header-inner">
                <button class="layout__menu-btn" @click="toggleSidebar" :ariaExpanded="sidebarOpen.toString()"
                    aria-controls="layout-sidebar" aria-label="Toggle navigation">
                    ☰
                </button>

                <div class="layout__brand" v-if="$slots.header">
                    <slot name="header"></slot>
                </div>
                <div class="layout__title" v-else>
                    <div class="layout__logo" aria-hidden="true">🔷</div>
                    <div class="layout__text">
                        <div class="layout__app-name">{{ title }}</div>
                        <div class="layout__app-sub">Admin</div>
                    </div>
                </div>

                <div class="layout__spacer"></div>

                <div class="layout__actions">
                    <slot name="actions"></slot>
                </div>
            </div>
        </header>

        <!-- Main area: sidebar + content -->
        <div class="layout__body">
            <!-- Sidebar -->
            <aside id="layout-sidebar" class="layout__sidebar" :class="{ 'is-open': sidebarOpen }" aria-hidden="false">
                <div class="layout__sidebar-inner">
                    <slot name="sidebar">
                        <!-- default sidebar content -->
                        <nav>
                            <ul class="nav">
                                <li><a href="#">Dashboard</a></li>
                                <li><a href="#">Pages</a></li>
                                <li><a href="#">Users</a></li>
                                <li><a href="#">Settings</a></li>
                            </ul>
                        </nav>
                    </slot>
                </div>
            </aside>

            <!-- overlay for small screens -->
            <div class="layout__overlay" v-if="sidebarOpen" @click="closeSidebar" aria-hidden="true" />

            <!-- Main content -->
            <main class="layout__main" role="main">
                <div class="layout__container">
                    <slot />
                </div>
            </main>
        </div>

        <!-- Footer -->
        <footer class="layout__footer" role="contentinfo">
            <slot name="footer">
                <div class="layout__footer-inner">
                    © {{ new Date().getFullYear() }} — Built with Vue + Vite
                </div>
            </slot>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
    title: { type: String, default: 'App' },
    initialSidebarOpen: { type: Boolean, default: false }
})

const sidebarOpen = ref<boolean>(props.initialSidebarOpen)

function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
}
function closeSidebar() {
    sidebarOpen.value = false
}

// keep document title in sync with prop
watch(
    () => props.title,
    (t) => {
        if (t) document.title = t
    },
    { immediate: true }
)

// close sidebar on escape for accessibility
onMounted(() => {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeSidebar()
    })
})
</script>

<style scoped>
:root {
    --header-height: 64px;
    --sidebar-width: 240px;
    --bg: #f7f8fb;
    --surface: #ffffff;
    --muted: #6b7280;
    --accent: #2563eb;
    --shadow: 0 1px 3px rgba(16, 24, 40, 0.06);
}

.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: #0f172a;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Header */
.layout__header {
    height: var(--header-height);
    background: var(--surface);
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    z-index: 40;
}

.layout__header-inner {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
    gap: 1rem;
}

.layout__menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    border-radius: 6px;
}

.layout__brand,
.layout__title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.layout__logo {
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    font-size: 18px;
}

.layout__app-name {
    font-weight: 600;
}

.layout__app-sub {
    font-size: 12px;
    color: var(--muted);
}

.layout__spacer {
    flex: 1;
}

/* Body */
.layout__body {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    min-height: calc(100vh - var(--header-height));
}

/* Sidebar */
.layout__sidebar {
    width: var(--sidebar-width);
    background: var(--surface);
    border-right: 1px solid rgba(15, 23, 42, 0.04);
    padding: 1rem;
    box-sizing: border-box;
    transition: transform 0.22s ease, visibility 0.22s;
}

.layout__sidebar .nav {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.layout__sidebar .nav a {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    color: inherit;
    text-decoration: none;
}

.layout__sidebar .nav a:hover {
    background: rgba(37, 99, 235, 0.06);
    color: var(--accent);
}

/* Main */
.layout__main {
    flex: 1 1 auto;
    padding: 1.25rem;
}

.layout__container {
    max-width: 1200px;
    margin: 0 auto;
}

/* Footer */
.layout__footer {
    background: transparent;
    padding: 0.5rem 1rem;
    font-size: 13px;
    color: var(--muted);
}

/* Overlay for mobile */
.layout__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    z-index: 30;
}

/* Responsive behavior */
@media (max-width: 920px) {
    .layout__sidebar {
        position: fixed;
        left: 0;
        top: var(--header-height);
        bottom: 0;
        transform: translateX(-100%);
        z-index: 35;
        box-shadow: 0 8px 20px rgba(2, 6, 23, 0.12);
    }

    .layout__sidebar.is-open {
        transform: translateX(0);
    }

    .layout__main {
        padding-top: 1rem;
    }
}

/* Desktop: keep sidebar visible */
@media (min-width: 921px) {
    .layout__menu-btn {
        display: none;
    }

    .layout__overlay {
        display: none;
    }
}
</style>
