<template>
    <Teleport to="body">
        <div v-if="modelValue" class="fixed inset-0 z-9999 flex items-center justify-center" @keydown.esc="close">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/40" @click="backdropCloses ? close() : null"></div>

            <!-- Dialog -->
            <div class="relative bg-white rounded-xl shadow-2xl w-full" :class="sizeClass" role="dialog"
                aria-modal="true">
                <!-- Header -->
                <div v-if="$slots.title || showClose" class="flex items-center justify-between px-4 py-3 border-b">
                    <div class="font-semibold text-base">
                        <slot name="title"></slot>
                    </div>
                    <button v-if="showClose" class="rounded border px-2 py-1 text-sm" @click="close">Schließen</button>
                </div>

                <!-- Body -->
                <div class="p-4">
                    <slot></slot>
                </div>

                <!-- Footer -->
                <div v-if="$slots.footer" class="px-4 py-3 border-t flex justify-end gap-2">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
    modelValue: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl' | 'full'
    backdropCloses?: boolean
    showClose?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'max-w-sm'
        case 'md': return 'max-w-md'
        case 'lg': return 'max-w-lg'
        case 'xl': return 'max-w-xl'
        case '2xl': return 'max-w-2xl'
        case '3xl': return 'max-w-3xl'
        case '5xl': return 'max-w-5xl'
        case 'full': return 'max-w-[90vw] h-[90vh] overflow-auto'
        default: return 'max-w-xl'
    }
})

function close() { emit('update:modelValue', false) }

// Scroll-Lock, solange Modal offen
function lockScroll(lock: boolean) {
    const b = document.body
    if (lock) {
        b.style.overflow = 'hidden'
    } else {
        b.style.overflow = ''
    }
}
watch(() => props.modelValue, v => lockScroll(!!v))
onMounted(() => { if (props.modelValue) lockScroll(true) })
onBeforeUnmount(() => lockScroll(false))
</script>
