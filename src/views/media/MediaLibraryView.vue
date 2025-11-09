<template>
    <div class="w-full p-6 mx-auto">
        <!-- Kopf -->
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Mediathek</h1>
            <div class="flex gap-2">
                <RouterLink to="/media/deleted"
                    class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <i class="fa fa-trash"></i> Papierkorb
                </RouterLink>
                <button
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    @click="openUpload = true">
                    <i class="fa fa-upload"></i> Hochladen
                </button>
            </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="m in items" :key="m.id" class="group border rounded-lg overflow-hidden bg-white">
                <div class="aspect-video bg-gray-100 flex items-center justify-center">
                    <img v-if="isImage(m)" :src="previews[m.id] || ''" class="w-full h-full object-cover"
                        @error="reloadPreview(m)" />
                    <div v-else class="flex items-center justify-center">
                        <UiIcon :name="mediaIconName(m)" class="h-12 w-12 text-gray-400" />
                    </div>
                </div>

                <div class="p-3">
                    <div class="font-medium truncate" :title="m.title || m.current_version?.original_name">
                        {{ m.title || m.current_version?.original_name }}
                    </div>
                    <div class="text-xs text-gray-500">
                        v{{ m.current_version?.version }} • {{ prettyBytes(m.current_version?.size || 0) }}
                    </div>
                    <div class="mt-2 flex justify-between items-center">
                        <button class="text-primary-700 hover:underline text-sm" @click="openDetails(m)">
                            Details
                        </button>
                        <button class="text-sm text-gray-600 hover:text-gray-900" @click="openEdit(m)">
                            <i class="fa fa-pen"></i> Bearbeiten
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upload Dialog -->
        <div v-if="openUpload" class="fixed inset-0 z-1000">
            <div class="absolute inset-0 bg-black/30" @click="openUpload = false" />
            <div class="absolute inset-0 flex items-center justify-center p-6">
                <div class="w-full max-w-lg bg-white rounded-xl p-6">
                    <h2 class="text-xl font-semibold mb-3">Datei hochladen</h2>
                    <FileUpload v-model="files" accept="image/*,pdf,doc,docx,xlsx,ppt,pptx,txt,csv,json,md"
                        accept-label="Bilder & Dokumente" />
                    <div class="mt-4 flex justify-end gap-2">
                        <button class="border px-3 py-2 rounded-lg" @click="openUpload = false">Abbrechen</button>
                        <button class="bg-primary-600 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                            :disabled="!files.length || uploading" @click="doUpload">
                            {{ uploading ? 'Lädt…' : 'Hochladen' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- SlideOver: Details -->
        <SlideOver :open="panelDetails" @close="panelDetails = false">
            <template #title>Medium</template>

            <div v-if="selected">
                <div class="mb-4">
                    <component :is="currentPreviewComponent" :blob="detailBlob" />

                    <div class="mt-3 text-sm text-gray-600 border rounded-lg bg-white p-3">
                        <div class="flex items-center gap-2 font-medium">
                            <UiIcon :name="mediaIconName(selected)" class="h-5 w-5 text-gray-500" />
                            <span>{{ selected.title || selected.current_version?.original_name }}</span>
                        </div>
                        <div><b>MIME:</b> {{ selected.current_version?.mime_type || '–' }}</div>
                        <div><b>Größe:</b> {{ prettyBytes(selected.current_version?.size || 0) }}</div>
                        <div v-if="selected.current_version?.width">
                            <b>Maße:</b> {{ selected.current_version?.width }}×{{ selected.current_version?.height }}px
                        </div>
                        <div class="mt-2">
                            <a :href="downloadHref(selected.id)" class="text-primary-700 hover:underline">Download</a>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg border p-3 bg-white">
                    <div class="font-semibold mb-2">Versionen</div>
                    <ul class="space-y-2">
                        <li v-for="v in selected.versions || []" :key="v.id" class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <UiIcon :name="versionIconName(v)" class="h-4 w-4 text-gray-500" />
                                <span class="text-sm">v{{ v.version }} – {{ v.original_name }}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <a :href="downloadHref(selected.id, v.version)"
                                    class="text-sm text-gray-700 hover:underline">DL</a>
                                <button class="text-sm text-primary-700 hover:underline"
                                    :disabled="selected.current_version_id === v.id" @click="activate(v.version)">
                                    {{ selected.current_version_id === v.id ? 'Aktiv' : 'Aktivieren' }}
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </SlideOver>

        <!-- SlideOver: Bearbeiten / Löschen -->
        <SlideOver :open="panelEdit" @close="panelEdit = false">
            <template #title>Medium bearbeiten</template>

            <div v-if="selected">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Titel</label>
                        <input v-model="form.title" type="text" class="mt-1 w-full rounded border px-3 py-2"
                            placeholder="z. B. Header Banner" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Collection</label>
                        <input v-model="form.collection" type="text" class="mt-1 w-full rounded border px-3 py-2"
                            placeholder="z. B. marketing" />
                    </div>
                </div>

                <div class="mt-8">
                    <button class="text-red-600 hover:underline text-sm" @click="doTrash(selected.id)">
                        <i class="fa fa-trash"></i> In den Papierkorb verschieben
                    </button>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <button class="border px-3 py-2 rounded-lg" @click="panelEdit = false">Schließen</button>
                    <button class="bg-primary-600 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                        :disabled="saving" @click="doSave">
                        {{ saving ? 'Speichern…' : 'Speichern' }}
                    </button>
                </div>
            </template>
        </SlideOver>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import FileUpload from '@/components/FileUpload.vue'
import SlideOver from '@/components/SlideOver.vue'
import PdfPreview from '@/components/previews/PdfPreview.vue'
import DocxPreview from '@/components/previews/DocxPreview.vue'
import XlsxPreview from '@/components/previews/XlsxPreview.vue'
import TextPreview from '@/components/previews/TextPreview.vue'
import {
    listMedia,
    uploadMedia,
    trash,
    fetchMediaBlob,
    updateMedia,
    setCurrentVersion,
    downloadUrl as downloadHref,
    uploadVersion,
    type MediaItem,
    type MediaVersion,
} from '@/api/media'
import axios from '@/lib/axios'
import { useToast } from '@stratton-cologne/vue-smart-toast'
import { Icon as UiIcon } from '@stratton-cologne/ui'
import { iconNameByMime, iconNameByExtension } from '@stratton-cologne/ui'

const { showToast } = useToast()

const items = ref<MediaItem[]>([])
const previews = ref<Record<number, string | undefined>>({})
const objectUrls = new Set<string>()

const openUpload = ref(false)
const files = ref<File[]>([])
const uploading = ref(false)

const panelEdit = ref(false)
const panelDetails = ref(false)
const selected = ref<MediaItem | null>(null)
const detailBlob = ref<Blob | null>(null)
const form = ref<{ title: string | undefined; collection: string | undefined }>({
    title: undefined,
    collection: undefined,
})
const saving = ref(false)

// Neue Version (Details-Drawer)
const showNewVersion = ref(false)
const filesNewVersion = ref<File[]>([])
const uploadingVersion = ref(false)

function isImage(m: MediaItem | null) {
    return !!m && (m.current_version?.mime_type || '').startsWith('image/')
}
function prettyBytes(n: number) {
    return n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`
}

/* Helpers: Dateiendung + Iconname */
function extFromName(name?: string): string {
    if (!name) return ''
    const i = name.lastIndexOf('.')
    return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}
function mediaIconName(m: MediaItem): string {
    const mime = m.current_version?.mime_type || ''
    const ext = extFromName(m.current_version?.original_name)
    return iconNameByMime(mime) || iconNameByExtension(ext)
}
function versionIconName(v: MediaVersion): string {
    const mime = v.mime_type || ''
    const ext = extFromName(v.original_name)
    return iconNameByMime(mime) || iconNameByExtension(ext)
}

async function load() {
    const page = await listMedia({ perPage: 24, withVersions: false } as any)
    items.value = (page as any).data ?? (page as any)
    for (const m of items.value) {
        if (isImage(m)) await loadPreview(m)
    }
}

function revokePreview(id: number) {
    const url = previews.value[id]
    if (url) {
        URL.revokeObjectURL(url)
        objectUrls.delete(url)
        delete previews.value[id]
    }
}

async function loadPreview(m: MediaItem) {
    try {
        const blob = await fetchMediaBlob(m.id)
        const url = URL.createObjectURL(blob)
        objectUrls.add(url)
        previews.value[m.id] = url
    } catch {
        previews.value[m.id] = undefined
    }
}

function reloadPreview(m: MediaItem) {
    revokePreview(m.id)
    loadPreview(m)
}

async function doUpload() {
    if (!files.value.length) return
    uploading.value = true
    try {
        await uploadMedia(files.value[0]!)
        openUpload.value = false
        files.value = []
        await load()
    } finally {
        uploading.value = false
    }
}

async function openDetails(m: MediaItem) {
    selected.value = (await axios.get(`/api/media/${m.id}`, { params: { withVersions: true } })).data
    panelDetails.value = true
    showNewVersion.value = false
    filesNewVersion.value = []
    try {
        detailBlob.value = await fetchMediaBlob(selected.value!.id)
    } catch {
        detailBlob.value = null
    }
}

function openEdit(m: MediaItem) {
    selected.value = m
    // Null -> undefined normalisieren (TS-kompatibel)
    form.value = { title: m.title ?? undefined, collection: m.collection }
    panelEdit.value = true
}

async function doSave() {
    if (!selected.value) return
    saving.value = true
    try {
        const updated = await updateMedia(selected.value.id, {
            title: form.value.title,
            collection: form.value.collection,
        })
        const idx = items.value.findIndex((i) => i.id === updated.id)
        if (idx >= 0) items.value[idx] = { ...items.value[idx], ...updated }
        showToast({
            key: 'media-save',
            message: 'Änderungen gespeichert',
            type: 'success',
            duration: 2000,
            position: 'top-right',
        })
        panelEdit.value = false
    } finally {
        saving.value = false
    }
}

function toggleNewVersion() {
    showNewVersion.value = !showNewVersion.value
}
function cancelNewVersion() {
    showNewVersion.value = false
    filesNewVersion.value = []
}

async function doUploadVersion() {
    const sel = selected.value
    if (!sel || !filesNewVersion.value.length) return
    uploadingVersion.value = true
    try {
        await uploadVersion(sel.id, filesNewVersion.value[0]!)
        selected.value = (await axios.get(`/api/media/${sel.id}`, { params: { withVersions: true } })).data
        try {
            detailBlob.value = await fetchMediaBlob(sel.id)
        } catch {
            detailBlob.value = null
        }
        await load()
        showNewVersion.value = false
        filesNewVersion.value = []
        showToast({
            key: 'media-newver',
            message: 'Neue Version gespeichert',
            type: 'success',
            duration: 2200,
            position: 'top-right',
        })
    } finally {
        uploadingVersion.value = false
    }
}

async function activate(version: number) {
    const sel = selected.value
    if (!sel) return
    await setCurrentVersion(sel.id, version)
    selected.value = (await axios.get(`/api/media/${sel.id}`, { params: { withVersions: true } })).data
    try {
        detailBlob.value = await fetchMediaBlob(sel.id)
    } catch {
        detailBlob.value = null
    }
    await load()
}

async function doTrash(id: number) {
    await trash(id)
    revokePreview(id)
    items.value = items.value.filter((i) => i.id !== id)
    panelEdit.value = false
    panelDetails.value = false
    showToast({
        key: 'media-trash',
        message: 'In den Papierkorb verschoben',
        type: 'success',
        duration: 2200,
        position: 'top-right',
    })
}

const currentPreviewComponent = computed(() => {
    const mime = selected.value?.current_version?.mime_type || ''
    const name = (selected.value?.current_version?.original_name || '').toLowerCase()

    if (mime === 'application/pdf' || name.endsWith('.pdf')) return PdfPreview
    if (mime.includes('word') || name.endsWith('.docx')) return DocxPreview
    if (mime.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.csv')) return XlsxPreview
    if (
        mime.startsWith('text/') ||
        name.endsWith('.txt') ||
        name.endsWith('.json') ||
        name.endsWith('.md') ||
        name.endsWith('.csv')
    )
        return TextPreview
    return TextPreview
})

onBeforeUnmount(() => {
    for (const url of objectUrls) URL.revokeObjectURL(url)
    objectUrls.clear()
})
onMounted(load)
</script>
