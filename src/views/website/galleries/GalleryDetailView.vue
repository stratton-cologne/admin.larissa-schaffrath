<template>
    <div class="w-full p-6 mx-auto">
        <!-- Header / Aktionen -->
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ g?.title || 'Galerie' }}</h1>
                <p class="text-sm text-slate-500" v-if="g?.description">{{ g?.description }}</p>
            </div>

            <div class="flex gap-2">
                <button class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                    @click="openEdit = true">
                    <i class="fa fa-pen"></i> Bearbeiten
                </button>

                <button
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    @click="openAddImage = true">
                    <i class="fa fa-image"></i> Bilder hinzufügen
                </button>

                <div class="flex items-center gap-2">
                    <input v-model="newCategoryName" placeholder="Neue Kategorie"
                        class="rounded border px-2 py-1 text-sm" />
                    <button class="rounded border px-2 py-1 text-sm" @click="addCategory">Anlegen</button>
                </div>
            </div>
        </div>

        <!-- Tabelle der Bilder -->
        <DataTable :columns="columns" :rows="imageRows" empty-text="Keine Bilder in dieser Galerie">
            <template #cell-preview="{ row }">
                <div class="w-28 aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    <img v-if="row.isImage && row.previewUrl" :src="row.previewUrl" class="w-full h-full object-cover"
                        alt="" />
                    <div v-else class="p-2 text-[10px] text-slate-500">
                        {{ row.originalName || 'Datei' }}
                    </div>
                </div>
            </template>

            <template #cell-file="{ row }">
                <div class="text-sm font-medium text-gray-900">{{ row.titleOrName }}</div>
                <div class="text-xs text-slate-500">#{{ row.mediaId }} • {{ row.mime || 'Unbekannt' }}</div>
            </template>

            <template #cell-caption="{ row }">
                <div class="text-sm">{{ row.caption || '–' }}</div>
            </template>

            <template #cell-position="{ row }">
                <input type="number" class="w-20 rounded border px-2 py-1 text-sm" :value="row.position"
                    @change="updatePos(row.__raw, ($event.target as HTMLInputElement).value)" />
            </template>

            <template #cell-categories="{ row }">
                <div class="flex flex-wrap gap-1">
                    <span v-for="c in row.categories" :key="c.id"
                        class="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                        {{ c.name }}
                    </span>
                    <span v-if="!row.categories?.length" class="text-xs text-slate-400">—</span>
                </div>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-2">
                    <button class="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs"
                        @click="openEditImage(row.__raw)">
                        <i class="fa fa-pen"></i> Bearb.
                    </button>
                    <button
                        class="inline-flex items-center gap-1 rounded-lg border border-red-500 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
                        @click="remove(row.__raw.id)">
                        <i class="fa fa-trash"></i> Entfernen
                    </button>
                </div>
            </template>
        </DataTable>

        <!-- ===== Modals ===== -->

        <!-- Galerie bearbeiten -->
        <Modal v-model="openEdit" size="xl" :backdropCloses="true" :showClose="true">
            <template #title>Galerie bearbeiten</template>

            <form class="flex flex-col gap-4" @submit.prevent="saveGallery">
                <label class="text-sm">Titel</label>
                <input v-model="form.title" class="rounded border px-3 py-2" required />

                <label class="text-sm">Beschreibung</label>
                <textarea v-model="form.description" class="rounded border px-3 py-2" rows="3"></textarea>

                <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" v-model="form.is_published" /> Veröffentlicht
                </label>

                <div class="flex justify-end gap-2">
                    <button type="button" class="rounded border px-3 py-2 text-sm"
                        @click="openEdit = false">Abbrechen</button>
                    <button type="submit"
                        class="rounded bg-primary-600 text-white px-3 py-2 text-sm hover:bg-primary-700"
                        :disabled="busy">
                        <span v-if="busy">Speichere…</span>
                        <span v-else>Speichern</span>
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Bilder hinzufügen (Mediathek) -->
        <Modal v-model="openAddImage" size="5xl" :backdropCloses="true" :showClose="true">
            <template #title>Bilder aus Mediathek hinzufügen</template>

            <div class="flex items-center justify-between mb-4">
                <select v-model="categoryToApply" class="rounded border px-2 py-1 text-sm">
                    <option :value="null">Keine Kategorie</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>

                <button
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
                    :disabled="selected.size === 0 || busy" @click="appendSelected">
                    Hinzufügen ({{ selected.size }})
                </button>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <label v-for="m in media" :key="m.id" class="relative cursor-pointer rounded border overflow-hidden">
                    <input type="checkbox" class="absolute left-2 top-2 z-10" :checked="selected.has(m.id)"
                        @change="toggleSelect(m.id)" />
                    <img :src="previews[m.id] || ''" class="aspect-square object-cover w-full h-full" alt="" />
                    <div class="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] p-1 truncate">
                        {{ m.title || m.current_version?.original_name }}
                    </div>
                </label>
            </div>

            <template #footer>
                <button class="rounded border px-3 py-2 text-sm" @click="openAddImage = false">Schließen</button>
            </template>
        </Modal>

        <!-- Einzelnes Galerie-Bild bearbeiten -->
        <Modal v-model="openEditImg" size="xl" :backdropCloses="true" :showClose="true">
            <template #title>Bild bearbeiten</template>

            <form class="flex flex-col gap-4" @submit.prevent="saveImage">
                <div class="flex gap-3 items-start">
                    <img v-if="editImg?.media" :src="previews[editImg.media?.id] || ''"
                        class="w-36 h-36 object-cover rounded" alt="" />
                    <div class="flex-1 grid gap-3">
                        <label class="text-sm">Caption</label>
                        <input v-model="editCaption" class="rounded border px-3 py-2" />

                        <label class="text-sm">Position</label>
                        <input v-model.number="editPosition" type="number" class="rounded border px-3 py-2 w-28" />

                        <label class="text-sm">Kategorien</label>
                        <div class="flex flex-wrap gap-2">
                            <label v-for="c in categories" :key="c.id"
                                class="inline-flex items-center gap-2 text-sm rounded border px-2 py-1">
                                <input type="checkbox" :value="c.id" v-model="editCategoryIds" />
                                {{ c.name }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 mb-2">
                    <input v-model="newCategoryName" placeholder="Neue Kategorie"
                        class="rounded border px-2 py-1 text-sm" />
                    <button class="rounded border px-2 py-1 text-sm" @click="addCategory">Anlegen</button>
                </div>

                <div class="flex justify-end gap-2">
                    <button type="button" class="rounded border px-3 py-2 text-sm"
                        @click="openEditImg = false">Abbrechen</button>
                    <button type="submit"
                        class="rounded bg-primary-600 text-white px-3 py-2 text-sm hover:bg-primary-700"
                        :disabled="busy">
                        <span v-if="busy">Speichere…</span>
                        <span v-else>Speichern</span>
                    </button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import DataTable, { type Column } from '@/components/common/DataTable.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from '@stratton-cologne/vue-smart-toast'

import {
    getGallery,
    updateGallery,
    addGalleryImage,
    removeGalleryImage,
    updateGalleryImage,
    listCategories,
    createCategory,
    type Gallery,
    type GalleryImage as GImg,
    type Category,
} from '@/api/galleries'
import { listMedia, fetchMediaBlob, type MediaItem } from '@/api/media'

const { showToast } = useToast()
const route = useRoute()
const id = Number(route.params.id)

const g = ref<Gallery | null>(null)
const openEdit = ref(false)
const form = ref({ title: '', description: '', is_published: false })

const openAddImage = ref(false)
const media = ref<MediaItem[]>([])
const selected = ref<Set<number>>(new Set())
const categories = ref<Category[]>([])
const categoryToApply = ref<number | null>(null)

const openEditImg = ref(false)
const editImg = ref<GImg | null>(null)
const editCaption = ref<string>('')
const editPosition = ref<number>(0)
const editCategoryIds = ref<number[]>([])

const busy = ref(false)

/* === Previews (Blobs mit Auth) === */
const previews = ref<Record<number, string | undefined>>({})
const objectUrls = new Set<string>()

function revokePreview(id: number) {
    const url = previews.value[id]
    if (url) {
        URL.revokeObjectURL(url)
        objectUrls.delete(url)
        delete previews.value[id]
    }
}

async function loadPreview(mediaId?: number, mime?: string) {
    if (!mediaId) return
    if (!(mime || '').startsWith('image/')) {
        previews.value[mediaId] = undefined
        return
    }
    try {
        const blob = await fetchMediaBlob(mediaId)
        const url = URL.createObjectURL(blob)
        objectUrls.add(url)
        previews.value[mediaId] = url
    } catch {
        previews.value[mediaId] = undefined
    }
}

async function refreshPreviews() {
    const imgs = g.value?.images || []
    for (const gi of imgs) {
        await loadPreview(gi.media?.id, gi.media?.current_version?.mime_type || '')
    }
}

/* Tabellen-Setup */
const columns: Column[] = [
    { key: 'preview', label: 'VORSCHAU' },
    { key: 'file', label: 'DATEI' },
    { key: 'caption', label: 'CAPTION' },
    { key: 'position', label: 'POSITION' },
    { key: 'categories', label: 'KATEGORIEN' },
    { key: 'actions', label: '', align: 'right' },
]

/* Rows */
const imageRows = computed(() =>
    (g.value?.images || []).map((img) => {
        const mediaId = img.media?.id as number | undefined
        return {
            __raw: img,
            previewUrl: mediaId ? previews.value[mediaId] || '' : '',
            isImage: (img.media?.current_version?.mime_type || '').startsWith('image/'),
            originalName: img.media?.current_version?.original_name,
            mime: img.media?.current_version?.mime_type,
            // Nur Dateiname nutzen; media.title existiert im Typ nicht
            titleOrName: img.media?.current_version?.original_name,
            caption: img.caption,
            position: img.position,
            mediaId,
            categories: img.categories || [],
        }
    }),
)

/* Data Loading */
function errMsg(e: any, fallback = 'Fehler') {
    const status = e?.response?.status
    const detail = e?.response?.data?.message || e?.message
    return `${fallback}${status ? ' (' + status + ')' : ''}: ${detail || ''}`
}

async function load() {
    try {
        g.value = await getGallery(id)
        form.value = {
            title: g.value.title,
            description: g.value.description || '',
            is_published: !!g.value.is_published,
        }
    } catch (e) {
        console.error(e)
        showToast({
            key: 'load-g',
            message: errMsg(e, 'Galerie konnte nicht geladen werden'),
            type: 'error',
            duration: 3500,
            position: 'top-right',
        })
    }
}

async function loadAux() {
    try {
        const page = await listMedia({ perPage: 100 } as any)
        media.value = (page as any).data ?? (page as any)
        for (const m of media.value) {
            await loadPreview(m.id, m.current_version?.mime_type || '')
        }
        categories.value = await listCategories()
    } catch (e) {
        console.error(e)
    }
}

/* Bilder hinzufügen */
function toggleSelect(mid: number) {
    if (selected.value.has(mid)) selected.value.delete(mid)
    else selected.value.add(mid)
}
async function appendSelected() {
    if (!selected.value.size) return
    busy.value = true
    try {
        for (const mid of selected.value) {
            await addGalleryImage(id, {
                media_id: mid,
                caption: '',
                // KORREKT: API erwartet "categories" (IDs), nicht "category_ids"
                categories: categoryToApply.value ? [categoryToApply.value] : [],
            } as any)
        }
        selected.value.clear()
        await load()
        await refreshPreviews()
        showToast({ key: 'g-img-added', message: 'Bilder hinzugefügt', type: 'success', duration: 1800, position: 'top-right' })
    } catch (e) {
        console.error(e)
        showToast({
            key: 'g-img-add-err',
            message: errMsg(e, 'Bilder konnten nicht hinzugefügt werden'),
            type: 'error',
            duration: 3500,
            position: 'top-right',
        })
    } finally {
        busy.value = false
    }
}

/* Bestand ändern */
async function updatePos(img: GImg, val: string) {
    const pos = Number(val)
    if (!Number.isFinite(pos)) return
    try {
        await updateGalleryImage(id, img.id, { position: pos } as any)
        await load()
        showToast({ key: 'g-pos-upd', message: 'Position gespeichert', type: 'success', duration: 1600, position: 'top-right' })
    } catch (e) {
        console.error(e)
        showToast({
            key: 'g-pos-err',
            message: errMsg(e, 'Position konnte nicht geändert werden'),
            type: 'error',
            duration: 3000,
            position: 'top-right',
        })
    }
}

/* Remove */
async function remove(imageId: number) {
    try {
        await removeGalleryImage(id, imageId)
        showToast({ key: 'g-img-removed', message: 'Bild entfernt', type: 'success', duration: 1800, position: 'top-right' })
        await load()
        await refreshPreviews()
    } catch (e) {
        console.error(e)
        showToast({
            key: 'g-img-rem-err',
            message: errMsg(e, 'Bild konnte nicht entfernt werden'),
            type: 'error',
            duration: 3500,
            position: 'top-right',
        })
    }
}

/* Einzelbild bearbeiten */
function openEditImage(img: GImg) {
    editImg.value = img
    editCaption.value = img.caption || ''
    editPosition.value = img.position || 0
    editCategoryIds.value = (img.categories || []).map((c) => c.id)
    openEditImg.value = true
}
async function saveImage() {
    if (!editImg.value) return
    busy.value = true
    try {
        await updateGalleryImage(id, editImg.value.id, {
            caption: editCaption.value,
            position: editPosition.value,
            // KORREKT: "categories"
            categories: editCategoryIds.value,
        } as any)
        openEditImg.value = false
        await load()
        await refreshPreviews()
        showToast({ key: 'g-img-saved', message: 'Bild gespeichert', type: 'success', duration: 1800, position: 'top-right' })
    } catch (e) {
        console.error(e)
        showToast({
            key: 'g-img-save-err',
            message: errMsg(e, 'Konnte nicht speichern'),
            type: 'error',
            duration: 3200,
            position: 'top-right',
        })
    } finally {
        busy.value = false
    }
}

/* Galerie speichern */
async function saveGallery() {
    busy.value = true
    try {
        await updateGallery(id, {
            title: form.value.title,
            description: form.value.description,
            is_published: form.value.is_published,
        } as any)
        openEdit.value = false
        await load()
        showToast({ key: 'g-saved', message: 'Galerie gespeichert', type: 'success', duration: 1800, position: 'top-right' })
    } catch (e) {
        console.error(e)
        showToast({
            key: 'g-save-err',
            message: errMsg(e, 'Galerie konnte nicht gespeichert werden'),
            type: 'error',
            duration: 3200,
            position: 'top-right',
        })
    } finally {
        busy.value = false
    }
}

/* Kategorien anlegen (Quick-Add) */
const newCategoryName = ref('')
async function addCategory() {
    if (!newCategoryName.value.trim()) return
    try {
        await createCategory({ name: newCategoryName.value.trim() } as any)
        newCategoryName.value = ''
        categories.value = await listCategories()
        showToast({ key: 'cat-added', message: 'Kategorie angelegt', type: 'success', duration: 2000, position: 'top-right' })
    } catch (e: any) {
        showToast({ key: 'cat-err', message: 'Kategorie konnte nicht angelegt werden', type: 'error', duration: 3000, position: 'top-right' })
        console.error(e)
    }
}

/* Boot */
onMounted(async () => {
    await load()
    await loadAux()
    await refreshPreviews()
})

onBeforeUnmount(() => {
    for (const url of objectUrls) URL.revokeObjectURL(url)
    objectUrls.clear()
})
</script>
