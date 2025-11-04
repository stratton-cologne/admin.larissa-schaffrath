<template>
    <div class="w-full max-h-[65vh] overflow-auto border rounded-lg bg-white p-3">
        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <table v-else class="min-w-full border-collapse">
            <thead v-if="rows.length && header.length">
                <tr>
                    <th v-for="(h, i) in header" :key="i"
                        class="border px-2 py-1 text-left text-xs font-semibold bg-gray-50">
                        {{ h }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(r, ri) in rows" :key="ri">
                    <td v-for="(h, ci) in header" :key="ci" class="border px-2 py-1 text-sm">
                        {{ r[h] }}
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="!rows.length && !error" class="text-sm text-gray-500">Keine Daten in der ersten Tabelle.</div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ blob?: Blob | null }>()
const rows = ref<any[]>([])
const header = ref<string[]>([])
const error = ref<string | null>(null)

async function render() {
    error.value = null; rows.value = []; header.value = []
    if (!props.blob) return
    try {
        const XLSX = await import('xlsx')
        const ab = await props.blob.arrayBuffer()
        const wb = XLSX.read(ab, { type: 'array' })
        const firstSheetName = wb.SheetNames?.[0]
        if (!firstSheetName) return
        const ws = wb.Sheets[firstSheetName]
        if (!ws) return

        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[]
        rows.value = json.slice(0, 200)
        header.value = rows.value.length ? Object.keys(rows.value[0]) : []
    } catch (e: any) {
        error.value = 'Diese XLSX-Datei kann nicht gerendert werden.'
        console.error(e)
    }
}
watch(() => props.blob, render, { immediate: true })
</script>
