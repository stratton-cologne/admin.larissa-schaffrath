<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Kontakt</h1>
            <button
                class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                :disabled="busy" @click="save">
                {{ busy ? 'Speichern…' : 'Speichern' }}
            </button>
        </div>

        <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div class="w-full lg:w-1/3 rounded-xl border bg-white p-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium">E-Mail</label>
                    <input v-model="form.email" type="email" class="mt-1 w-full rounded border px-3 py-2"
                        placeholder="info@example.com" />
                </div>
                <div>
                    <label class="block text-sm font-medium">Telefon</label>
                    <input v-model="form.phone" type="text" class="mt-1 w-full rounded border px-3 py-2"
                        placeholder="+49 …" />
                </div>
                <div class="flex items-center gap-2">
                    <input id="pub" v-model="form.is_published" type="checkbox" class="h-4 w-4" />
                    <label for="pub" class="text-sm">Veröffentlicht</label>
                </div>
            </div>

            <div class="w-full lg:w-1/3 rounded-xl border bg-white p-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium">Headline</label>
                    <input v-model="form.headline" type="text" class="mt-1 w-full rounded border px-3 py-2"
                        placeholder="Hallo, du kannst mich per E-Mail kontaktieren unter" />
                </div>
                <div>
                    <label class="block text-sm font-medium">Subline</label>
                    <input v-model="form.subline" type="text" class="mt-1 w-full rounded border px-3 py-2"
                        placeholder="mein Name ist" />
                </div>
                <div>
                    <label class="block text-sm font-medium">Interessens-Label</label>
                    <input v-model="form.interest_label" type="text" class="mt-1 w-full rounded border px-3 py-2"
                        placeholder="und ich bin interessiert an" />
                </div>
            </div>

            <div class="w-full lg:w-1/3 rounded-xl border bg-white p-4 space-y-4">
                <h2 class="font-semibold mb-2">Interessen (Auswahl-Optionen)</h2>

                <div class="flex flex-wrap gap-2 mb-3">
                    <span v-for="(int, i) in form.interests" :key="i"
                        class="inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-sm">
                        {{ int }}
                        <button class="text-red-500 hover:text-red-700" @click="removeInterest(i)">
                            <i class="fa fa-times"></i>
                        </button>
                    </span>
                    <span v-if="!form.interests?.length" class="text-xs text-gray-400">keine Interessen
                        hinterlegt</span>
                </div>

                <div class="flex gap-2">
                    <input v-model="newInterest" type="text" placeholder="Neues Interesse (z. B. Portrait)"
                        class="rounded border px-3 py-2 flex-1" @keyup.enter="addInterest" />
                    <button class="rounded border px-3 py-2 text-sm" @click="addInterest">Hinzufügen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@stratton-cologne/vue-smart-toast'
import { getContact, updateContact, type Contact } from '@/api/contact'

const { showToast } = useToast()
const busy = ref(false)
const form = ref<Contact>({
    email: '',
    phone: '',
    headline: '',
    subline: '',
    interest_label: '',
    interests: [],
    is_published: true,
})

const newInterest = ref('')
function addInterest() {
    const val = newInterest.value.trim()
    if (!val) return
    if (!form.value.interests) form.value.interests = []
    if (!form.value.interests.includes(val)) form.value.interests.push(val)
    newInterest.value = ''
}

function removeInterest(i: number) {
    form.value.interests?.splice(i, 1)
}

async function load() {
    const c = await getContact()
    if (c) form.value = { ...form.value, ...c }
}

async function save() {
    busy.value = true
    try {
        await updateContact(form.value)
        showToast({ key: 'c-saved', message: 'Kontakt gespeichert', type: 'success', duration: 2200, position: 'top-right' })
    } catch (e: any) {
        console.error(e)
        showToast({ key: 'c-err', message: 'Kontakt konnte nicht gespeichert werden', type: 'error', duration: 3500, position: 'top-right' })
    } finally {
        busy.value = false
    }
}

onMounted(load)
</script>
