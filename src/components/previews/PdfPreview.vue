<template>
    <div class="w-full h-[55vh] md:h-[65vh]">
        <iframe v-if="url" :src="url" class="w-full h-full border rounded-lg bg-white"></iframe>
        <div v-else class="h-full flex items-center justify-center text-gray-400">Lade PDF…</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ blob?: Blob | null }>()
const url = ref<string | null>(null)

function makeUrl() {
    if (!props.blob) return
    const u = URL.createObjectURL(new Blob([props.blob], { type: props.blob.type || 'application/pdf' }))
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = u
}
watch(() => props.blob, makeUrl, { immediate: true })

onBeforeUnmount(() => { if (url.value) URL.revokeObjectURL(url.value) })
</script>
