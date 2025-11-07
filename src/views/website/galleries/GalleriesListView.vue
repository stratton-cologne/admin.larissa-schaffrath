<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Galleries</h1>
            <button
                class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                @click="openCreate = true">
                <i class="fa fa-plus"></i> Neue Galerie
            </button>
        </div>

        <DataTable :columns="columns" :rows="rows" empty-text="Keine Galerien vorhanden">
            <template #cell-title="{ row }">
                <RouterLink class="font-semibold text-gray-900 hover:underline"
                    :to="{ name: 'GalleryDetail', params: { id: row.id } }">
                    {{ row.title }}
                </RouterLink>
                <div class="text-xs text-slate-500">/{{ row.slug }}</div>
            </template>
            <template #cell-images_count="{ value }">
                <span class="text-sm">{{ value ?? 0 }}</span>
            </template>
            <template #cell-state="{ row }">
                <span class="inline-flex items-center gap-2 text-sm">
                    <span class="h-2 w-2 rounded-full"
                        :class="row.is_published ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                    {{ row.is_published ? 'veröffentlicht' : 'Entwurf' }}
                </span>
            </template>
            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-2">
                    <RouterLink :to="{ name: 'GalleryDetail', params: { id: row.id } }"
                        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50">
                        <i class="fa fa-eye"></i> Öffnen
                    </RouterLink>
                    <button
                        class="inline-flex items-center gap-2 rounded-lg border border-red-500 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                        @click="del(row.id)">
                        <i class="fa fa-trash"></i> Löschen
                    </button>
                </div>
            </template>
        </DataTable>

        <!-- Create Modal -->
        <div v-if="openCreate" class="fixed inset-0 bg-black/20 flex items-center justify-center p-6">
            <div class="w-full max-w-lg rounded-2xl bg-white p-6">
                <h3 class="text-lg font-semibold mb-4">Neue Galerie</h3>
                <form @submit.prevent="create">
                    <label class="block text-sm mb-1">Titel</label>
                    <input v-model="form.title" class="w-full rounded-lg border px-3 py-2 mb-3" required />
                    <label class="block text-sm mb-1">Beschreibung</label>
                    <textarea v-model="form.description" class="w-full rounded-lg border px-3 py-2 mb-3"
                        rows="3"></textarea>
                    <label class="inline-flex items-center gap-2 mb-4">
                        <input type="checkbox" v-model="form.is_published" /> Veröffentlichen
                    </label>
                    <div class="flex justify-end gap-2">
                        <button type="button" class="rounded-lg border px-3 py-2"
                            @click="openCreate = false">Abbrechen</button>
                        <button type="submit" class="rounded-lg bg-primary-600 px-3 py-2 text-white">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import DataTable, { type Column } from '@/components/common/DataTable.vue'
import { listGalleries, createGallery, deleteGallery, type Gallery } from '@/api/galleries'
import { useToast } from '@stratton-cologne/vue-smart-toast'
const { showToast } = useToast()

const rows = ref<Gallery[]>([])
const columns: Column[] = [
    { key: 'title', label: 'Titel', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'images_count', label: 'Bilder', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'state', label: 'Status', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'actions', label: '', headerClass: 'text-right', cellClass: 'text-right' },
]

async function load() { rows.value = (await listGalleries()) ?? []; }
async function del(id: number) { await deleteGallery(id); showToast({ key: 'g-del', message: 'Galerie gelöscht', type: 'success', duration: 2200, position: 'top-right' }); await load() }

const openCreate = ref(false)
const form = ref({ title: '', description: '', is_published: false })
async function create() {
    await createGallery(form.value)
    openCreate.value = false
    showToast({ key: 'g-created', message: 'Galerie erstellt', type: 'success', duration: 2200, position: 'top-right' })
    await load()
}

onMounted(load)
</script>
