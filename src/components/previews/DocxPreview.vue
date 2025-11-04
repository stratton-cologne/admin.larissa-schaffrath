<template>
    <div class="w-full max-h-[65vh] overflow-auto border rounded-lg bg-white p-4">
        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <div v-else ref="container" class="prose max-w-none"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ blob?: Blob | null }>()
const container = ref<HTMLElement | null>(null)
const error = ref<string | null>(null)

async function render() {
    error.value = null
    if (!props.blob || !container.value) return
    try {
        const { default: docx } = await import('docx-preview')
        const ab = await props.blob.arrayBuffer()
        container.value.innerHTML = ''
        // WICHTIG: styleElement = undefined, options als 4. Parameter
        await docx.renderAsync(ab, container.value, undefined, { inWrapper: false })
    } catch (e: any) {
        error.value = 'Diese DOCX-Datei kann nicht gerendert werden.'
        console.error(e)
    }
}
watch(() => props.blob, render, { immediate: true })
onMounted(render)
</script>

<style scoped>
.prose :deep(table) {
    width: 100%;
    border-collapse: collapse;
}

.prose :deep(td),
.prose :deep(th) {
    border: 1px solid #e5e7eb;
    padding: 6px;
}
</style>
