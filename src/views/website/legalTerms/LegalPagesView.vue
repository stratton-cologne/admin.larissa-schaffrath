<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Rechtstexte</h1>
            <button class="rounded-lg bg-primary-600 text-white px-3 py-2 text-sm hover:bg-primary-700" :disabled="busy"
                @click="save">
                {{ busy ? 'Speichern…' : 'Speichern' }}
            </button>
        </div>

        <div class="mb-4 flex gap-2">
            <button :class="tabBtn('impressum')" @click="active = 'impressum'">Impressum</button>
            <button :class="tabBtn('datenschutz')" @click="active = 'datenschutz'">Datenschutz</button>
            <label class="ml-auto inline-flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="form.is_published" /> Veröffentlicht
            </label>
        </div>

        <div class="rounded-xl border bg-white p-4 space-y-3">
            <label class="block text-sm font-medium">Titel</label>
            <input v-model="form.title" class="w-full rounded border px-3 py-2" />

            <label class="block text-sm font-medium">Inhalt (Markdown oder HTML)</label>
            <textarea v-model="form.content" rows="18" class="w-full rounded border px-3 py-2 font-mono"></textarea>

            <div class="flex justify-end">
                <button class="rounded border px-3 py-2 text-sm" :disabled="busy" @click="save">Speichern</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getLegal, updateLegal, type LegalPage } from '@/api/legal'
import { useToast } from '@stratton-cologne/vue-smart-toast'

const { showToast } = useToast()
const busy = ref(false)
const active = ref<'impressum' | 'datenschutz'>('impressum')

const form = ref<LegalPage>({
    slug: 'impressum',
    title: 'Impressum',
    content: '',
    is_published: true,
})

function tabBtn(key: 'impressum' | 'datenschutz') {
    return [
        'px-3 py-1.5 rounded border text-sm',
        active.value === key ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white'
    ].join(' ')
}

async function load(slug: 'impressum' | 'datenschutz') {
    busy.value = true
    try {
        const p = await getLegal(slug)
        form.value = { ...p }
    } catch {
        // Falls noch nicht existiert, Default vorbefüllen
        form.value = { slug, title: slug === 'impressum' ? 'Impressum' : 'Datenschutzerklärung', content: '', is_published: true }
    } finally {
        busy.value = false
    }
}

async function save() {
    busy.value = true
    try {
        await updateLegal(form.value.slug, {
            title: form.value.title,
            content: form.value.content,
            is_published: form.value.is_published,
        })
        showToast({ key: 'legal-saved', message: 'Rechtstext gespeichert', type: 'success', duration: 2000, position: 'top-right' })
    } catch (e: any) {
        console.error(e)
        showToast({ key: 'legal-err', message: 'Konnte nicht speichern', type: 'error', duration: 3000, position: 'top-right' })
    } finally {
        busy.value = false
    }
}

watch(active, (s) => load(s))
onMounted(() => load(active.value))
</script>
