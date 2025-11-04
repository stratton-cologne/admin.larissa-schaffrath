<template>
    <div class="w-full p-6 mx-auto">
        <!-- Kopfzeile -->
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Benutzer</h1>

            <div class="flex gap-2">
                <RouterLink to="/users/deleted"
                    class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <i class="fa fa-trash"></i>
                    Papierkorb
                </RouterLink>

                <button
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    @click="openCreate">
                    <i class="fa fa-plus"></i>
                    Neu anlegen
                </button>
            </div>
        </div>

        <!-- Tabelle -->
        <DataTable :columns="columns" :rows="users" empty-text="Keine Benutzer gefunden">
            <template #cell-name="{ row }">
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700"
                        :title="row.name">
                        {{ getInitials(row.name) }}
                    </div>
                    <span class="font-medium text-gray-900">{{ row.name }}</span>
                </div>
            </template>

            <template #cell-email="{ value }">
                <span class="text-sm text-gray-700">{{ value }}</span>
            </template>

            <template #cell-role="{ value }">
                <span
                    class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                    {{ value || 'user' }}
                </span>
            </template>

            <template #cell-created_at="{ value }">
                <span class="text-sm text-gray-700">{{ formatDate(value) }}</span>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <button class="p-2 text-gray-600 hover:text-primary-600 transition" title="Bearbeiten"
                        @click="openEdit(row)">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>

                    <button class="p-2 text-gray-600 hover:text-red-600 transition" title="Deaktivieren (Soft-Delete)"
                        @click="askSoftDelete(row)">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                   4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </template>
        </DataTable>

        <!-- Slide-Over (Create/Edit) -->
        <transition name="slide">
            <div v-if="drawer.open" class="fixed inset-0 z-999" @keydown.esc="closeDrawer">
                <div class="absolute inset-0 bg-black/30" @click="closeDrawer" />
                <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-auto">
                    <h2 class="text-xl font-semibold mb-4">
                        {{ drawer.mode === 'create' ? 'Neuen Benutzer anlegen' : 'Benutzer bearbeiten' }}
                    </h2>

                    <form @submit.prevent="submitDrawer" class="space-y-4">
                        <label class="text-sm block">
                            <span class="block font-medium mb-1">Name</span>
                            <input v-model.trim="drawer.form.name" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500" />
                        </label>

                        <label class="text-sm block">
                            <span class="block font-medium mb-1">E-Mail</span>
                            <input v-model.trim="drawer.form.email" type="email" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500" />
                        </label>

                        <label class="text-sm block">
                            <span class="block font-medium mb-1">Rolle</span>
                            <select v-model="drawer.form.role"
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500">
                                <option value="user">Benutzer</option>
                                <option value="admin">Administrator</option>
                                <option value="editor">Redakteur</option>
                            </select>
                        </label>

                        <label v-if="drawer.mode === 'create'" class="text-sm block">
                            <span class="block font-medium mb-1">Passwort</span>
                            <input v-model="drawer.form.password" type="password" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500" />
                        </label>

                        <div class="mt-6 flex justify-end gap-2">
                            <button type="button"
                                class="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                                @click="closeDrawer">
                                Abbrechen
                            </button>
                            <button type="submit"
                                class="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                                :disabled="drawer.submitting">
                                {{ drawer.submitting ? 'Speichern…' : 'Speichern' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Slide-Over (Soft-Delete Bestätigung) -->
        <transition name="slide">
            <div v-if="confirm.open" class="fixed inset-0 z-1000" @keydown.esc="closeConfirm">
                <div class="absolute inset-0 bg-black/30" @click="closeConfirm" />
                <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-auto">
                    <h2 class="text-xl font-semibold mb-2">Benutzer deaktivieren</h2>
                    <p class="text-sm text-gray-600">
                        Soll der Benutzer
                        <span class="font-semibold text-gray-900">„{{ confirm.name }}“</span>
                        wirklich <span class="font-semibold">deaktiviert</span> (Soft-Delete) werden?
                        Du kannst ihn im Papierkorb wiederherstellen.
                    </p>

                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button"
                            class="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                            @click="closeConfirm">
                            Abbrechen
                        </button>
                        <button
                            class="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            :disabled="confirm.submitting" @click="performSoftDelete">
                            {{ confirm.submitting ? 'Deaktivieren…' : 'Deaktivieren' }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DataTable, { type Column } from '@/components/common/DataTable.vue'
import axios from '@/lib/axios'
import { useToast } from '@stratton-cologne/vue-smart-toast'

const { showToast } = useToast()

// Flexibles Row-Format für DataTable:
type RowUser = {
    id: number
    name: string
    email: string
    role?: string
    created_at?: string
}

const users = ref<RowUser[]>([])

const columns: Column[] = [
    { key: 'name', label: 'Benutzer', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'email', label: 'E-Mail', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'role', label: 'Rolle', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'created_at', label: 'Erstellt', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'actions', label: '', headerClass: 'text-right', cellClass: 'text-right' },
]

async function fetchUsers() {
    try {
        const { data } = await axios.get('/api/users')
        users.value = (data || []).map((u: any) => ({
            id: Number(u.id),
            name: String(u.name ?? ''),
            email: String(u.email ?? ''),
            role: u.role ?? 'user',
            created_at: u.created_at,
        }))
    } catch {
        showToast({ key: 'users-fetch', message: 'Fehler beim Laden der Benutzer', type: 'danger', duration: 3500, position: 'top-right' })
    }
}

function openCreate() {
    drawer.value = { open: true, mode: 'create', submitting: false, form: { name: '', email: '', role: 'user', password: '' } }
}
function openEdit(u: Record<string, any>) {
    const ru: RowUser = {
        id: Number(u.id),
        name: String(u.name ?? ''),
        email: String(u.email ?? ''),
        role: u.role ?? 'user',
        created_at: u.created_at,
    }
    drawer.value = { open: true, mode: 'edit', submitting: false, form: { id: ru.id, name: ru.name, email: ru.email, role: ru.role } }
}

// ---- Slide-Over: Create/Edit ----
const drawer = ref<{
    open: boolean
    mode: 'create' | 'edit'
    submitting: boolean
    form: Partial<RowUser & { password?: string }>
}>({
    open: false,
    mode: 'create',
    submitting: false,
    form: {}
})
function closeDrawer() { drawer.value.open = false }

async function submitDrawer() {
    drawer.value.submitting = true
    try {
        if (drawer.value.mode === 'create') {
            await axios.post('/api/users', drawer.value.form)
            showToast({ key: 'user-created', message: 'Benutzer angelegt', type: 'success', duration: 2200, position: 'top-right' })
        } else {
            await axios.put(`/api/users/${drawer.value.form.id}`, drawer.value.form)
            showToast({ key: 'user-updated', message: 'Benutzer aktualisiert', type: 'success', duration: 2200, position: 'top-right' })
        }
        closeDrawer(); await fetchUsers()
    } catch {
        showToast({ key: 'user-save-error', message: 'Speichern fehlgeschlagen', type: 'danger', duration: 3500, position: 'top-right' })
    } finally {
        drawer.value.submitting = false
    }
}

// ---- Slide-Over: Soft-Delete Bestätigung ----
const confirm = ref<{ open: boolean; submitting: boolean; id: number | null; name: string }>({
    open: false, submitting: false, id: null, name: ''
})

function askSoftDelete(row: Record<string, any>) {
    confirm.value = {
        open: true,
        submitting: false,
        id: Number(row.id),
        name: String(row.name ?? '')
    }
}
function closeConfirm() { confirm.value.open = false }

async function performSoftDelete() {
    if (!confirm.value.id) return
    confirm.value.submitting = true
    try {
        await axios.delete(`/api/users/${confirm.value.id}`)
        users.value = users.value.filter(u => u.id !== confirm.value!.id)
        showToast({ key: 'user-soft-deleted', message: 'Benutzer deaktiviert', type: 'success', duration: 2200, position: 'top-right' })
        closeConfirm()
    } catch {
        showToast({ key: 'user-delete-error', message: 'Deaktivieren fehlgeschlagen', type: 'danger', duration: 3500, position: 'top-right' })
    } finally {
        confirm.value.submitting = false
    }
}

function getInitials(name: string) {
    return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(d?: string) {
    return d ? new Date(d).toLocaleDateString('de-DE') : '—'
}

onMounted(fetchUsers)
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform .2s ease, opacity .2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>
