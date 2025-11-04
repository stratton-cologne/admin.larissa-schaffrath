<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Papierkorb – Medien</h1>
            <RouterLink to="/media/list"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <i class="fa fa-photo"></i> Zurück zur Liste
            </RouterLink>
        </div>

        <div class="space-y-3">
            <div v-for="m in items" :key="m.id"
                class="flex items-center justify-between border rounded-lg bg-white p-3">
                <div class="truncate">
                    <div class="font-medium truncate">{{ m.title || m.current_version?.original_name }}</div>
                    <div class="text-xs text-gray-500">{{ new Date(m.deleted_at!).toLocaleString('de-DE') }}</div>
                </div>
                <div class="flex gap-3">
                    <button class="text-sm text-primary-700 hover:underline"
                        @click="restoreItem(m.id)">Wiederherstellen</button>
                    <button class="text-sm text-red-600 hover:underline" @click="forceItem(m.id)">Endgültig
                        löschen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { listDeleted, restore, forceDelete, type MediaItem } from '@/api/media'
import { useToast } from '@stratton-cologne/vue-smart-toast'
const { showToast } = useToast()

const items = ref<MediaItem[]>([])

async function load() { items.value = await listDeleted() }
async function restoreItem(id: number) { await restore(id); await load(); showToast({ key: 'media-restore', message: 'Wiederhergestellt', type: 'success', duration: 2200, position: 'top-right' }) }
async function forceItem(id: number) { await forceDelete(id); items.value = items.value.filter(i => i.id !== id) }

onMounted(load)
</script>
