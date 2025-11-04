<template>
    <div v-if="open" class="fixed inset-0 z-[1200]">
        <div class="absolute inset-0 bg-black/30" @click="emit('close')" />
        <div class="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl flex flex-col slide">
            <div class="flex items-center justify-between px-4 py-3 border-b">
                <h3 class="text-lg font-semibold truncate">
                    <slot name="title">Details</slot>
                </h3>
                <button class="p-2 rounded hover:bg-gray-100" @click="emit('close')">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
                <slot />
            </div>
            <div v-if="$slots.footer" class="border-t p-4">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<style scoped>
.slide {
    animation: so-in .2s ease-out both;
}

@keyframes so-in {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}
</style>
