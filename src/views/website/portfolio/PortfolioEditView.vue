<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Portfolio</h1>
            <div class="flex gap-2">
                <button
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    :disabled="busy" @click="save">
                    {{ busy ? 'Speichern…' : 'Speichern' }}
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Linke Spalte -->
            <div class="lg:col-span-2 space-y-4">
                <div class="rounded-xl border bg-white p-4">
                    <h2 class="font-semibold mb-3">Person</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium">Name *</label>
                            <input v-model="form.name" type="text" class="mt-1 w-full rounded border px-3 py-2"
                                required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Tagline</label>
                            <input v-model="form.tagline" type="text" class="mt-1 w-full rounded border px-3 py-2"
                                placeholder="fotograf aus köln" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Ort</label>
                            <input v-model="form.location" type="text" class="mt-1 w-full rounded border px-3 py-2"
                                placeholder="Köln" />
                        </div>
                        <div class="flex items-center gap-2">
                            <input id="pub" v-model="form.is_published" type="checkbox" class="h-4 w-4" />
                            <label for="pub" class="text-sm">Veröffentlicht</label>
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border bg-white p-4">
                    <h2 class="font-semibold mb-3">Über mich</h2>
                    <textarea v-model="form.about" rows="8" class="w-full rounded border px-3 py-2"
                        placeholder="Kurzvorstellung, Arbeitsweise, Auszeichnungen …" />
                </div>

                <div class="rounded-xl border bg-white p-4">
                    <h2 class="font-semibold mb-3">Socials</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium">Instagram</label>
                            <input v-model="form.socials.instagram" type="text"
                                class="mt-1 w-full rounded border px-3 py-2" placeholder="@handle oder URL" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Flickr</label>
                            <input v-model="form.socials.flickr" type="text"
                                class="mt-1 w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Facebook</label>
                            <input v-model="form.socials.facebook" type="text"
                                class="mt-1 w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Twitter</label>
                            <input v-model="form.socials.twitter" type="text"
                                class="mt-1 w-full rounded border px-3 py-2" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rechte Spalte -->
            <div class="space-y-4">
                <div class="rounded-xl border bg-white p-4">
                    <h2 class="font-semibold mb-3">Avatar</h2>

                    <div class="flex items-center gap-4">
                        <div class="w-28 h-28 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                            <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" alt="" />
                            <div v-else class="text-xs text-gray-400">kein Bild</div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <button class="rounded border px-3 py-2 text-sm" @click="openPicker = true">
                                Aus Mediathek wählen
                            </button>
                            <button class="rounded border px-3 py-2 text-sm" :disabled="!form.avatar_media_id"
                                @click="clearAvatar">
                                Entfernen
                            </button>
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border bg-white p-4">
                    <h2 class="font-semibold mb-3">Vorschau-Infos</h2>
                    <div class="text-sm text-gray-600">
                        <div><b>Name:</b> {{ form.name || '—' }}</div>
                        <div><b>Tagline:</b> {{ form.tagline || '—' }}</div>
                        <div><b>Ort:</b> {{ form.location || '—' }}</div>
                        <div><b>Status:</b> {{ form.is_published ? 'veröffentlicht' : 'Entwurf' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Media-Picker -->
        <Modal v-model="openPicker" size="5xl" :backdropCloses="true" :showClose="true">
            <template #title>Avatar wählen</template>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <label v-for="m in media" :key="m.id" class="relative cursor-pointer rounded border overflow-hidden">
                    <input type="radio" name="avatar" class="absolute left-2 top-2 z-10" :value="m.id"
                        :checked="form.avatar_media_id === m.id" @change="selectAvatar(m)" />
                    <img :src="mediaPreviews[m.id] || ''" class="aspect-square object-cover w-full h-full" alt="" />
                    <div class="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] p-1 truncate">
                        {{ m.title || m.current_version?.original_name }}
                    </div>
                </label>
            </div>

            <template #footer>
                <button class="rounded border px-3 py-2 text-sm" @click="openPicker = false">Schließen</button>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from '@stratton-cologne/vue-smart-toast'
import { getPortfolio, updatePortfolio, type Portfolio } from '@/api/portfolio'
import { listMedia, fetchMediaBlob, type MediaItem } from '@/api/media'

const { showToast } = useToast()

const busy = ref(false)
const form = ref<Portfolio>({
    name: '',
    tagline: '',
    location: '',
    about: '',
    avatar_media_id: null,
    socials: { instagram: '', flickr: '', facebook: '', twitter: '' },
    is_published: false,
})

/* Avatar-Preview */
const avatarPreview = ref<string | null>(null)
const objectUrls = new Set<string>()
function revoke(url?: string | null) { if (url) { URL.revokeObjectURL(url); objectUrls.delete(url) } }

async function loadAvatarPreview(id?: number | null) {
    revoke(avatarPreview.value)
    avatarPreview.value = null
    if (!id) return
    try {
        const blob = await fetchMediaBlob(id)
        const url = URL.createObjectURL(blob)
        objectUrls.add(url)
        avatarPreview.value = url
    } catch { /* noop */ }
}

/* Media-Picker */
const openPicker = ref(false)
const media = ref<MediaItem[]>([])
const mediaPreviews = ref<Record<number, string | undefined>>({})

async function loadMedia() {
    const page = await listMedia({ perPage: 48 })
    media.value = page.data ?? page
    for (const m of media.value) {
        if ((m.current_version?.mime_type || '').startsWith('image/')) {
            try {
                const blob = await fetchMediaBlob(m.id)
                const url = URL.createObjectURL(blob)
                objectUrls.add(url)
                mediaPreviews.value[m.id] = url
            } catch { /* ignore */ }
        } else {
            mediaPreviews.value[m.id] = undefined
        }
    }
}
function selectAvatar(m: MediaItem) {
    form.value.avatar_media_id = m.id
    loadAvatarPreview(m.id)
}
function clearAvatar() {
    form.value.avatar_media_id = null
    loadAvatarPreview(null)
}

/* Load + Save */
async function load() {
    const p = await getPortfolio()
    if (p) {
        // defaults für evtl. fehlende Felder
        form.value = {
            name: p.name || '',
            tagline: p.tagline || '',
            location: p.location || '',
            about: p.about || '',
            avatar_media_id: p.avatar_media_id ?? p.avatar?.id ?? null,
            socials: { instagram: '', flickr: '', facebook: '', twitter: '', ...(p.socials || {}) },
            is_published: !!p.is_published,
        }
        await loadAvatarPreview(form.value.avatar_media_id ?? undefined)
    }
}
async function save() {
    busy.value = true
    try {
        const saved = await updatePortfolio(form.value)
        showToast({ key: 'pf-save', message: 'Portfolio gespeichert', type: 'success', duration: 2200, position: 'top-right' })
        // re-sync (falls Server etwas normalisiert)
        form.value = {
            name: saved.name,
            tagline: saved.tagline ?? '',
            location: saved.location ?? '',
            about: saved.about ?? '',
            avatar_media_id: saved.avatar_media_id ?? saved.avatar?.id ?? null,
            socials: { instagram: '', flickr: '', facebook: '', twitter: '', ...(saved.socials || {}) },
            is_published: !!saved.is_published,
        }
        await loadAvatarPreview(form.value.avatar_media_id ?? undefined)
    } catch (e: any) {
        console.error(e)
        const msg = e?.response?.data?.message || e?.message || 'Fehler'
        showToast({ key: 'pf-err', message: `Konnte nicht speichern: ${msg}`, type: 'error', duration: 3200, position: 'top-right' })
    } finally {
        busy.value = false
    }
}

onMounted(async () => {
    await load()
    await loadMedia()
})
onBeforeUnmount(() => {
    for (const url of objectUrls) URL.revokeObjectURL(url)
    objectUrls.clear()
})
</script>
