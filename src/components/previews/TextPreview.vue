<template>
    <div class="w-full max-h-[65vh] overflow-auto border rounded-lg bg-white p-3">
        <pre class="whitespace-pre-wrap text-sm text-gray-800" v-text="text || '…'" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ blob?: Blob | null, maxBytes?: number }>()
const text = ref<string>('')

async function load() {
    text.value = ''
    if (!props.blob) return
    const max = props.maxBytes ?? 200_000
    const slice = props.blob.size > max ? props.blob.slice(0, max) : props.blob
    const t = await slice.text()
    text.value = props.blob.size > max ? t + '\n… [gekürzt]' : t
}
watch(() => props.blob, load, { immediate: true })
</script>
