<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Client-Branding</h1>
            <button class="rounded-lg bg-primary-600 text-white px-3 py-2 text-sm hover:bg-primary-700" :disabled="busy"
                @click="save">
                {{ busy ? 'Speichern…' : 'Speichern' }}
            </button>
        </div>

        <div class="flex flex-wrap gap-6">
            <!-- Farben -->
            <section class="w-full lg:basis-[calc((100%-3rem)/3)] rounded-xl border bg-white p-4 space-y-4">

                <h2 class="font-semibold">Farben</h2>
                <div class="flex gap-6 items-center">
                    <div>
                        <label class="block text-sm">Primary</label>
                        <input v-model="form.primary_color" type="color" class="mt-1 w-16 h-10 p-0 border rounded" />
                    </div>
                    <div>
                        <label class="block text-sm">Secondary</label>
                        <input v-model="form.secondary_color" type="color" class="mt-1 w-16 h-10 p-0 border rounded" />
                    </div>
                </div>
            </section>

            <!-- Fonts -->
            <section class="w-full lg:basis-[calc((100%-3rem)/3)] rounded-xl border bg-white p-4 space-y-4">
                <h2 class="font-semibold">Schriften</h2>
                <!-- Primary Font -->
                <div class="space-y-3">
                    <div class="font-medium">Primary Font</div>
                    <div class="flex flex-wrap items-center gap-3">
                        <select v-model="primarySource" class="rounded border px-2 py-1 text-sm">
                            <option value="media">Mediathek</option>
                            <option value="url">URL (Google Fonts o.ä.)</option>
                        </select>

                        <input v-model="form.primary_font.name" type="text"
                            class="rounded border px-3 py-2 text-sm flex-1"
                            placeholder="Font-Name (z. B. Inter / ClientPrimary)" />
                        <button v-if="primarySource === 'media'" class="rounded border px-3 py-2 text-sm"
                            @click="openPicker('primary')">
                            Datei wählen
                        </button>
                        <input v-else v-model="form.primary_font.url" type="text"
                            class="rounded border px-3 py-2 text-sm flex-1"
                            placeholder="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" />
                    </div>
                    <div class="text-xs text-slate-500">
                        Unterstützte Dateien (Mediathek): .ttf, .otf, .woff, .woff2 – oder Google Fonts CSS-URL angeben.
                    </div>
                </div>

                <!-- Secondary Font -->
                <div class="space-y-3">
                    <div class="font-medium">Secondary Font</div>
                    <div class="flex flex-wrap items-center gap-3">
                        <select v-model="secondarySource" class="rounded border px-2 py-1 text-sm">
                            <option value="media">Mediathek</option>
                            <option value="url">URL (Google Fonts o.ä.)</option>
                        </select>

                        <input v-model="form.secondary_font.name" type="text"
                            class="rounded border px-3 py-2 text-sm flex-1"
                            placeholder="Font-Name (z. B. Inter Tight / ClientSecondary)" />
                        <button v-if="secondarySource === 'media'" class="rounded border px-3 py-2 text-sm"
                            @click="openPicker('secondary')">
                            Datei wählen
                        </button>
                        <input v-else v-model="form.secondary_font.url" type="text"
                            class="rounded border px-3 py-2 text-sm flex-1"
                            placeholder="https://… (Google Fonts CSS)" />
                    </div>
                </div>
            </section>

            <!-- Live-Vorschau Farben/Fonts -->
            <section class="w-full lg:basis-[calc((100%-3rem)/3)] rounded-xl border bg-white p-4 space-y-4">
                <h2 class="font-semibold mb-2">Live-Check</h2>
                <div class="space-x-2">
                    <button class="px-3 py-1 rounded text-white"
                        :style="{ background: form.primary_color }">Primary</button>
                    <button class="px-3 py-1 rounded text-white"
                        :style="{ background: form.secondary_color }">Secondary</button>
                </div>
                <div class="mt-3">
                    <div class="text-xs text-slate-500">Primary Font Probe</div>
                    <div :style="{ fontFamily: form.primary_font.name || 'system-ui' }"
                        class="border rounded px-2 py-1">
                        The quick brown fox jumps over the lazy dog.
                    </div>
                    <div class="mt-2 text-xs text-slate-500">Secondary Font Probe</div>
                    <div :style="{ fontFamily: form.secondary_font.name || 'system-ui' }"
                        class="border rounded px-2 py-1">
                        Sphinx of black quartz, judge my vow.
                    </div>
                </div>
            </section>

            <!-- Hintergrund -->
            <section class="lg:w-1/2 w-full min-w-[300px] rounded-xl border bg-white p-4 space-y-4">
                <h2 class="font-semibold">Hintergrund</h2>
                <div class="flex flex-wrap gap-3 items-center">
                    <select v-model="form.background.type" class="rounded border px-2 py-1 text-sm">
                        <option value="none">Keiner</option>
                        <option value="image">Bild</option>
                        <option value="video">Video</option>
                    </select>

                    <select v-model="bgSource" class="rounded border px-2 py-1 text-sm"
                        v-if="form.background.type !== 'none'">
                        <option value="media">Mediathek</option>
                        <option value="url">URL</option>
                    </select>

                    <button v-if="form.background.type !== 'none' && bgSource === 'media'"
                        class="rounded border px-3 py-2 text-sm" @click="openPicker('background')">
                        Datei wählen
                    </button>

                    <input v-if="form.background.type !== 'none' && bgSource === 'url'" v-model="form.background.url"
                        type="text" class="rounded border px-3 py-2 text-sm flex-1"
                        placeholder="https://… Bild- oder Video-URL" />

                    <select v-model="form.background.fit" class="rounded border px-2 py-1 text-sm">
                        <option value="cover">cover</option>
                        <option value="contain">contain</option>
                        <option value="fill">fill</option>
                        <option value="none">none</option>
                        <option value="scale-down">scale-down</option>
                    </select>

                    <input v-model="form.background.position" type="text" class="rounded border px-3 py-2 text-sm"
                        placeholder="center / top / left top …" />
                    <input v-model="form.background.overlay" type="text" class="rounded border px-3 py-2 text-sm"
                        placeholder="overlay (z. B. rgba(0,0,0,.25) oder 'none')" />
                </div>

                <div class="border rounded p-3 bg-gray-50">
                    <div class="text-sm mb-2">Vorschau</div>
                    <div class="relative aspect-video overflow-hidden rounded border bg-white">
                        <img v-if="form.background.type === 'image' && bgPreview" :src="bgPreview"
                            class="absolute inset-0 w-full h-full"
                            :style="{ objectFit: form.background.fit || 'cover', objectPosition: form.background.position || 'center' }" />
                        <video v-else-if="form.background.type === 'video' && bgPreview"
                            class="absolute inset-0 w-full h-full" autoplay loop muted playsinline
                            :style="{ objectFit: form.background.fit || 'cover', objectPosition: form.background.position || 'center' }">
                            <source :src="bgPreview" />
                        </video>
                        <div v-if="(form.background.overlay && form.background.overlay !== 'none')"
                            class="absolute inset-0" :style="{ background: form.background.overlay }"></div>
                        <div v-if="!bgPreview" class="absolute inset-0 grid place-items-center text-sm text-slate-400">
                            Keine Datei gewählt</div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Media-Picker -->
        <Modal v-model="openPickerDialog" size="5xl" :backdropCloses="true" :showClose="true">
            <template #title>Datei wählen</template>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <label v-for="m in media" :key="m.id" class="relative cursor-pointer rounded border overflow-hidden">
                    <input type="radio" name="pick" class="absolute left-2 top-2 z-10" :value="m.id"
                        @change="selectMedia(m)" />
                    <div class="aspect-square w-full h-full bg-white flex items-center justify-center overflow-hidden">
                        <template v-if="isImage(m)">
                            <img :src="previewOf(m.id)" class="w-full h-full object-contain" />
                        </template>
                        <template v-else-if="isVideo(m)">
                            <span class="text-xs text-slate-600 p-2">Video</span>
                        </template>
                        <template v-else-if="isFont(m)">
                            <span class="text-xs text-slate-600 p-2">Font</span>
                        </template>
                        <template v-else>
                            <span class="text-xs text-slate-400 p-2">Datei</span>
                        </template>
                    </div>
                </label>
            </div>
            <template #footer>
                <button class="rounded border px-3 py-2 text-sm" @click="openPickerDialog = false">Schließen</button>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { fetchClientSettings, saveClientSettings, type ClientSettings } from '@/api/clientSettings'
import { listMedia, fetchMediaBlob, type MediaItem } from '@/api/media'
import { useClientTheme } from '@/composables/useClientTheme'
import { useToast } from '@stratton-cologne/vue-smart-toast'

const { applyClientTheme } = useClientTheme()
const { showToast } = useToast()

const busy = ref(false)

// Form mit Defaults
const form = ref<ClientSettings>({
    primary_color: '#0ea5e9',
    secondary_color: '#f59e0b',
    primary_font: { name: 'System UI', media_id: null, url: null },
    secondary_font: { name: 'System UI', media_id: null, url: null },
    background: { type: 'none', media_id: null, url: null, fit: 'cover', position: 'center', overlay: 'none' }
})

/* ======== Media Picker & Previews ======== */
const openPickerDialog = ref(false)
const pickerTarget = ref<'primary' | 'secondary' | 'background' | null>(null)
const media = ref<MediaItem[]>([])
const objectUrls = new Set<string>()
const mediaPreviews = ref<Record<number, string | undefined>>({})

function previewOf(id: number) { return mediaPreviews.value[id] || '' }
function revokeAll() { for (const u of objectUrls) URL.revokeObjectURL(u); objectUrls.clear() }

function isImage(m: MediaItem) { return (m.current_version?.mime_type || '').startsWith('image/') }
function isVideo(m: MediaItem) { return (m.current_version?.mime_type || '').startsWith('video/') }
function isFont(m: MediaItem) {
    const mt = (m.current_version?.mime_type || '').toLowerCase()
    const name = (m.current_version?.original_name || '').toLowerCase()
    return mt.includes('font') || name.endsWith('.ttf') || name.endsWith('.otf') || name.endsWith('.woff') || name.endsWith('.woff2')
}

async function loadMedia() {
    const page = await listMedia({ perPage: 100 } as any)
    media.value = page.data ?? page
    for (const m of media.value) {
        if (isImage(m)) {
            try {
                const blob = await fetchMediaBlob(m.id)
                const url = URL.createObjectURL(blob)
                objectUrls.add(url)
                mediaPreviews.value[m.id] = url
            } catch { }
        } else {
            mediaPreviews.value[m.id] = undefined
        }
    }
}

function openPicker(target: 'primary' | 'secondary' | 'background') {
    pickerTarget.value = target
    openPickerDialog.value = true
}

function selectMedia(m: MediaItem) {
    if (!pickerTarget.value) return
    if (pickerTarget.value === 'primary') {
        form.value.primary_font.media_id = m.id
        form.value.primary_font.url = null
    } else if (pickerTarget.value === 'secondary') {
        form.value.secondary_font.media_id = m.id
        form.value.secondary_font.url = null
    } else if (pickerTarget.value === 'background') {
        form.value.background.media_id = m.id
        form.value.background.url = null
        // Preview für BG gleich aktualisieren
        loadBgPreview()
    }
}

/* ======== Quellenumschalter ======== */
const primarySource = ref<'media' | 'url'>('media')
const secondarySource = ref<'media' | 'url'>('media')
const bgSource = ref<'media' | 'url'>('media')

/* ======== BG Preview ======== */
const bgPreview = ref<string | null>(null)
async function loadBgPreview() {
    bgPreview.value = null
    const bg = form.value.background
    if (!bg || bg.type === 'none') return

    if (bgSource.value === 'media' && bg.media_id) {
        try {
            const blob = await fetchMediaBlob(bg.media_id)
            const url = URL.createObjectURL(blob)
            objectUrls.add(url)
            bgPreview.value = url
        } catch { }
    } else if (bgSource.value === 'url' && bg.url) {
        bgPreview.value = bg.url
    }
}

async function load() {
    const s = await fetchClientSettings()
    form.value = {
        primary_color: s.primary_color || '#0ea5e9',
        secondary_color: s.secondary_color || '#f59e0b',
        primary_font: { name: 'System UI', media_id: null, url: null, ...(s.primary_font || {}) },
        secondary_font: { name: 'System UI', media_id: null, url: null, ...(s.secondary_font || {}) },
        background: { type: 'none', media_id: null, url: null, fit: 'cover', position: 'center', overlay: 'none', ...(s.background || {}) }
    }

    // Quellen aus den Daten herleiten
    primarySource.value = form.value.primary_font.media_id ? 'media' : (form.value.primary_font.url ? 'url' : 'media')
    secondarySource.value = form.value.secondary_font.media_id ? 'media' : (form.value.secondary_font.url ? 'url' : 'media')
    bgSource.value = form.value.background.media_id ? 'media' : (form.value.background.url ? 'url' : 'media')

    await loadBgPreview()
}

async function save() {
    // Konsistenz: Quelle bestimmt, welcher Key gesetzt ist
    if (primarySource.value === 'media') form.value.primary_font.url = null
    else form.value.primary_font.media_id = null

    if (secondarySource.value === 'media') form.value.secondary_font.url = null
    else form.value.secondary_font.media_id = null

    if (form.value.background.type === 'none') {
        form.value.background.media_id = null
        form.value.background.url = null
    } else if (bgSource.value === 'media') {
        form.value.background.url = null
    } else {
        form.value.background.media_id = null
    }

    try {
        const saved = await saveClientSettings(form.value)
        await applyClientTheme(saved)
        showToast({ key: 'client-saved', message: 'Client-Branding gespeichert', type: 'success', duration: 2000, position: 'top-right' })
    } catch (e: any) {
        console.error(e)
        showToast({ key: 'client-err', message: 'Konnte nicht speichern', type: 'error', duration: 3000, position: 'top-right' })
    }
}

onMounted(async () => { await load(); await loadMedia() })
onBeforeUnmount(() => revokeAll())
</script>
