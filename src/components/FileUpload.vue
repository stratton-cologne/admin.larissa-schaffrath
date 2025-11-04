<template>
    <div class="border-2 border-dashed border-gray-300 rounded-soft p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
        @dragover.prevent @drop.prevent="handleDrop" @click="triggerFileInput">
        <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" class="hidden"
            @change="handleFileChange" />
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-600 mb-2">
            <span class="font-semibold text-primary-600">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">{{ acceptLabel || 'Any file' }}</p>

        <div v-if="files.length" class="mt-4 space-y-2">
            <div v-for="(file, index) in files" :key="index"
                class="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-soft">
                <span class="text-sm text-gray-700">{{ file.name }}</span>
                <button type="button" class="text-red-500 hover:text-red-700" @click.stop="removeFile(index)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    accept?: string
    acceptLabel?: string
    multiple?: boolean
    modelValue?: File[]
}>()

const emit = defineEmits<{
    'update:modelValue': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const files = ref<File[]>(props.modelValue || [])

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        files.value = Array.from(target.files)
        emit('update:modelValue', files.value)
    }
}

const handleDrop = (event: DragEvent) => {
    if (event.dataTransfer?.files) {
        files.value = Array.from(event.dataTransfer.files)
        emit('update:modelValue', files.value)
    }
}

const removeFile = (index: number) => {
    files.value.splice(index, 1)
    emit('update:modelValue', files.value)
}
</script>
