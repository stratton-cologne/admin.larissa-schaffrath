<template>
    <div class="p-6 max-w-7xl space-y-8">
        <!-- Header -->
        <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 class="text-2xl font-semibold tracking-tight">Branding & Theme</h1>

            <div class="flex flex-wrap items-center gap-3">
                <!-- Vorschau Toggle -->
                <div
                    class="flex items-center gap-2 rounded-xl border border-accent-background-800 bg-accent-background px-3 py-2">
                    <span class="text-sm text-slate-600">Vorschau:</span>
                    <label class="inline-flex items-center gap-1 text-sm">
                        <input type="radio" value="auto" v-model="previewMode" /> Auto
                    </label>
                    <label class="inline-flex items-center gap-1 text-sm">
                        <input type="radio" value="light" v-model="previewMode" /> Light
                    </label>
                    <label class="inline-flex items-center gap-1 text-sm">
                        <input type="radio" value="dark" v-model="previewMode" /> Dark
                    </label>
                </div>

                <!-- Force Mode -->
                <select v-model="form.theme.mode"
                    class="h-10 rounded-lg border border-accent-background-800 px-3 text-sm text-slate-800 ">
                    <option value="system">System</option>
                    <option value="light">Immer Light</option>
                    <option value="dark">Immer Dark</option>
                </select>

                <button
                    class="h-10 inline-flex items-center justify-center rounded-xl px-4 text-white shadow-sm disabled:opacity-70 disabled:cursor-not-allowed bg-primary"
                    :disabled="busySave" @click="save">
                    {{ busySave ? 'Speichern…' : 'Speichern' }}
                </button>
            </div>
        </header>

        <!-- Titel -->
        <section class="rounded-xl border bg-accent-background border-accent-background-800 shadow-sm">
            <div class="px-5 py-3 border-b border-accent-background-800 text-sm font-semibold text-slate-700 ">
                Allgemein
            </div>
            <div class="p-5">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-center">
                    <label class="text-sm font-medium text-slate-700 ">Titel</label>
                    <input v-model="form.title" type="text"
                        class="h-10 w-full rounded-lg border px-3 py-2 bg-white border-accent-background-800 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
            </div>
        </section>

        <!-- Logos + Farben + Vorschau -->
        <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2 space-y-6">
                <!-- Logos -->
                <div class="rounded-xl border border-accent-background-800 bg-accent-background shadow-sm">
                    <div class="px-5 py-3 border-b border-accent-background-800 text-sm font-semibold text-slate-700 ">
                        Logos
                    </div>
                    <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Light Logo -->
                        <div class="space-y-3">
                            <div class="text-sm font-medium">Logo (Light)</div>
                            <div class="flex items-center gap-4">
                                <img v-if="preview.logo_light" :src="preview.logo_light" alt="Logo Light"
                                    class="h-14 w-auto rounded-md border border-accent-background-800 object-contain p-2" />
                                <div class="flex-1">
                                    <input type="file" accept="image/*" @change="onSelectFile($event, 'light')" class="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-3
                                        file:rounded-md file:border-0 file:text-sm file:font-medium
                                        file:bg-primary file:text-slate-700 hover:file:bg-slate-200" />
                                    <div v-if="settings.logo_light_url && !preview.logo_light"
                                        class="text-xs text-slate-500 mt-1">
                                        Aktuell:
                                        <a :href="settings.logo_light_url" target="_blank"
                                            class="underline text-blue-600">ansehen</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Dark Logo -->
                        <div class="space-y-3">
                            <div class="text-sm font-medium">Logo (Dark)</div>
                            <div class="flex items-center gap-4">
                                <img v-if="preview.logo_dark" :src="preview.logo_dark" alt="Logo Dark"
                                    class="h-14 w-auto rounded-md border border-accent-background-800 object-contain p-2" />
                                <div class="flex-1">
                                    <input type="file" accept="image/*" @change="onSelectFile($event, 'dark')"
                                        class="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-slate-700 hover:file:bg-slate-200" />
                                    <div v-if="settings.logo_dark_url && !preview.logo_dark"
                                        class="text-xs text-slate-500 mt-1">
                                        Aktuell:
                                        <a :href="settings.logo_dark_url" target="_blank"
                                            class="underline text-blue-600">ansehen</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Theme-Farben -->
                <div class="rounded-xl border border-accent-background-800 bg-accent-background shadow-sm">
                    <div
                        class="px-5 py-3 border-b border-accent-background-800 flex items-center justify-between gap-4 ">
                        <div class="text-sm font-semibold text-slate-700">Theme-Farben</div>

                        <!-- Segmented Control (Light / Dark) -->
                        <div class="inline-flex items-center rounded-lg border border-slate-200 accent-background-700 bg-slate-50 p-1"
                            role="tablist" aria-label="Theme-Auswahl">
                            <button type="button" :class="tabBtnClass('light')" role="tab" aria-selected="true"
                                @click="activeThemeTab = 'light'">
                                Light
                            </button>
                            <button type="button" :class="tabBtnClass('dark')" role="tab" aria-selected="false"
                                @click="activeThemeTab = 'dark'">
                                Dark
                            </button>
                        </div>
                    </div>

                    <div class="p-5">
                        <!-- TabPanel: interne Tab-Leiste ausblenden, Steuerung über activeThemeTab -->
                        <TabPanel class="**:data-[role=tab-list]:hidden" :tabs="[
                            { key: 'light', label: 'Light' },
                            { key: 'dark', label: 'Dark' }
                        ]" v-model:activeTab="activeThemeTab" width="100%">
                            <!-- Light -->
                            <template #tab-light>
                                <div class="p-1 sm:p-2">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                        <ThemeColorField label="Primary" v-model="form.theme.light.primary" />
                                        <ThemeColorField label="Primary Text" v-model="form.theme.light.text" />
                                        <ThemeColorField label="Primary Background"
                                            v-model="form.theme.light.background" />
                                        <br />
                                        <ThemeColorField label="Accent" v-model="form.theme.light.accent" />
                                        <ThemeColorField label="Accent Text" v-model="form.theme.light.accentText" />
                                        <ThemeColorField label="Accent Background"
                                            v-model="form.theme.light.accentBackground" />
                                        <br />
                                        <ThemeColorField label="Sidebar BG"
                                            v-model="form.theme.light.sidebarBackground" />
                                        <ThemeColorField label="Sidebar Text" v-model="form.theme.light.sidebarText" />
                                        <ThemeColorField label="Nav BG" v-model="form.theme.light.navBackground" />
                                        <ThemeColorField label="Nav Text" v-model="form.theme.light.navText" />
                                    </div>
                                </div>
                            </template>

                            <!-- Dark -->
                            <template #tab-dark>
                                <div class="p-1 sm:p-2">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                        <ThemeColorField label="Primary" v-model="form.theme.dark.primary" />
                                        <ThemeColorField label="Primary Text" v-model="form.theme.dark.text" />
                                        <ThemeColorField label="Primary Background"
                                            v-model="form.theme.dark.background" />
                                        <br />
                                        <ThemeColorField label="Accent" v-model="form.theme.dark.accent" />
                                        <ThemeColorField label="Accent Text" v-model="form.theme.dark.accentText" />
                                        <ThemeColorField label="Accent Background"
                                            v-model="form.theme.dark.accentBackground" />
                                        <br />
                                        <ThemeColorField label="Sidebar BG"
                                            v-model="form.theme.dark.sidebarBackground" />
                                        <ThemeColorField label="Sidebar Text" v-model="form.theme.dark.sidebarText" />
                                        <ThemeColorField label="Nav BG" v-model="form.theme.dark.navBackground" />
                                        <ThemeColorField label="Nav Text" v-model="form.theme.dark.navText" />
                                    </div>
                                </div>
                            </template>
                        </TabPanel>
                    </div>
                </div>
            </div>

            <!-- Live Vorschau -->
            <div
                class="rounded-xl border border-accent-background-800 bg-accent-background shadow-sm xl:sticky xl:top-4 h-fit">
                <div class="px-5 py-3 border-b border-accent-background-800 text-sm font-semibold text-slate-700">
                    Live-Vorschau
                </div>
                <div class="p-0">
                    <div class="flex h-80">
                        <!-- Sidebar -->
                        <aside class="w-56 p-4 space-y-2"
                            :style="{ background: currentBranch.sidebarBackground, color: currentBranch.sidebarText }">
                            <div class="font-semibold mb-1">Sidebar</div>
                            <ul class="space-y-1 text-sm">
                                <li class="flex items-center gap-2">
                                    <span class="inline-block h-2 w-2 rounded-full"
                                        :style="{ background: currentBranch.primary }"></span>
                                    Dashboard
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="inline-block h-2 w-2 rounded-full"
                                        :style="{ background: currentBranch.accent }"></span>
                                    Users
                                </li>
                                <li>Settings</li>
                                <li>Logs</li>
                            </ul>
                        </aside>

                        <!-- Main -->
                        <section class="flex-1 flex flex-col">
                            <nav class="px-4 py-3 text-sm border-b border-accent-background-800"
                                :style="{ background: currentBranch.navBackground, color: currentBranch.navText }">
                                Navigation
                            </nav>
                            <div class="p-4 space-x-2">
                                <button
                                    class="inline-flex items-center px-3 py-1.5 rounded-md text-white text-sm shadow-sm"
                                    :style="{ background: currentBranch.primary }">
                                    Primary
                                </button>
                                <button
                                    class="inline-flex items-center px-3 py-1.5 rounded-md text-white text-sm shadow-sm"
                                    :style="{ background: currentBranch.accent }">
                                    Accent
                                </button>
                            </div>
                            <div class="px-4 pb-4 text-xs text-slate-500">
                                Modus: <b>{{ effectiveModeLabel }}</b>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import axios from '@/lib/axios'
import { useToast } from '@stratton-cologne/vue-smart-toast'
import { env } from '@/lib/env'
import { useTheme } from '@/composables/useTheme'
import ThemeColorField from '@/components/ThemeColorField.vue'
import { TabPanel } from '@stratton-cologne/ui'

type ThemeBranch = {
    primary: string;
    text: string;
    background: string;
    accent: string;
    accentText: string;
    accentBackground: string;
    sidebarBackground: string;
    sidebarText: string;
    navBackground: string;
    navText: string;
}
type ThemePayload = {
    mode: 'system' | 'light' | 'dark'
    light: ThemeBranch
    dark: ThemeBranch
}
type AdminSettings = {
    id?: number
    title: string
    logo_light_media_id: number | null
    logo_dark_media_id: number | null
    theme: ThemePayload
    logo_light_url?: string | null
    logo_dark_url?: string | null
}

const { showToast } = useToast()
const { applyTheme } = useTheme()

const settings = reactive<AdminSettings>({
    title: '',
    logo_light_media_id: null,
    logo_dark_media_id: null,
    theme: {
        mode: 'system',
        light: {
            primary: '#ff9900', text: '', background: '#f8f9fa',
            accent: '#10b981', accentText: '#ffffff', accentBackground: '#f8f9fa',
            sidebarBackground: '#ffffff', sidebarText: '#1f2937', navBackground: '#ffffff', navText: '#1f2937'
        },
        dark: {
            primary: '#ff9900', text: '', background: '#1e293b',
            accent: '#10b981', accentText: '#ffffff', accentBackground: '#1e293b',
            sidebarBackground: '#0f172a', sidebarText: '#ffffff', navBackground: '#0f172a', navText: '#ffffff'
        },
    },
})

const form = reactive<AdminSettings>(JSON.parse(JSON.stringify(settings)))
const busyLoad = ref(false)
const busySave = ref(false)
const preview = reactive<{ logo_light: string | null; logo_dark: string | null }>({ logo_light: null, logo_dark: null })
const previewMode = ref<'auto' | 'light' | 'dark'>('auto')

/** Aktiver Farben-Tab (steuert TabPanel + Header-Buttons) */
const activeThemeTab = ref<'light' | 'dark'>('light')

/** Button-Klassen für die Segmented Control */
function tabBtnClass(key: 'light' | 'dark') {
    const active = activeThemeTab.value === key
    return [
        'px-3 h-8 text-sm rounded-md transition-colors',
        active
            ? 'bg-white text-slate-900 shadow dark:bg-slate-900'
            : 'text-slate-600 hover:text-slate-800 dark:hover:text-slate-100'
    ].join(' ')
}

function u(path: string) {
    return `${env.apiBaseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

onMounted(async () => { await load() })

async function load() {
    busyLoad.value = true
    try {
        const res = await axios.get(u('/api/admin/settings'))
        const incoming = res.data as AdminSettings
        // Optional: normalizeTheme(incoming.theme) falls Server nicht alle Keys liefert
        Object.assign(settings, incoming)
        Object.assign(form, JSON.parse(JSON.stringify(settings)))
        applyTheme({ mode: settings.theme.mode, light: settings.theme.light, dark: settings.theme.dark })

        // aktiven Tab passend zum Modus wählen
        activeThemeTab.value = settings.theme.mode === 'dark' ? 'dark' : 'light'
    } catch {
        showToast({ key: 'settings-load', message: 'Konnte Settings nicht laden.', type: 'error', duration: 3000, position: 'top-right' })
    } finally {
        busyLoad.value = false
    }
}

async function save() {
    busySave.value = true
    try {
        const res = await axios.put(u('/api/admin/settings'), form)
        Object.assign(settings, res.data)
        Object.assign(form, JSON.parse(JSON.stringify(settings)))
        preview.logo_light = null
        preview.logo_dark = null
        applyTheme({ mode: settings.theme.mode, light: settings.theme.light, dark: settings.theme.dark })
        showToast({ key: 'settings-save', message: 'Gespeichert & angewendet.', type: 'success', duration: 2500, position: 'top-right' })
    } catch {
        showToast({ key: 'settings-save-err', message: 'Fehler beim Speichern.', type: 'error', duration: 3000, position: 'top-right' })
    } finally {
        busySave.value = false
    }
}

async function onSelectFile(evt: Event, which: 'light' | 'dark') {
    const input = evt.target as HTMLInputElement
    if (!input.files || !input.files[0]) return
    const file = input.files[0]
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', `logo-${which}`)
    fd.append('collection', 'branding')

    try {
        const res = await axios.post(u('/api/media'), fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        const mediaId = res.data?.id as number
        const reader = new FileReader()
        reader.onload = () => {
            if (which === 'light') {
                preview.logo_light = String(reader.result)
                form.logo_light_media_id = mediaId
            } else {
                preview.logo_dark = String(reader.result)
                form.logo_dark_media_id = mediaId
            }
        }
        reader.readAsDataURL(file)
    } catch {
        showToast({ key: 'logo-upload', message: 'Logo-Upload fehlgeschlagen.', type: 'error', duration: 3000, position: 'top-right' })
    } finally {
        input.value = ''
    }
}

/** Live-Vorschau: Branch bestimmen */
const currentBranch = computed<ThemeBranch>(() => {
    const mode = previewMode.value === 'auto' ? form.theme.mode : previewMode.value
    return mode === 'dark' ? form.theme.dark : form.theme.light
})
const effectiveModeLabel = computed(() => {
    const m = previewMode.value === 'auto' ? form.theme.mode : previewMode.value
    return m === 'system' ? 'System (prefers-color-scheme)' : (m === 'light' ? 'Light' : 'Dark')
})
</script>
