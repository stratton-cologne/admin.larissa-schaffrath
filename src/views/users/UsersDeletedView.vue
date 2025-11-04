<template>
    <div class="w-full p-6 mx-auto">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Gelöschte Benutzer</h1>

            <RouterLink to="/users/list"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <i class="fa fa-users"></i>
                Zurück zur Liste
            </RouterLink>
        </div>

        <DataTable :columns="columns" :rows="users" empty-text="Keine gelöschten Benutzer vorhanden">
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

            <template #cell-deleted_at="{ value }">
                <span class="text-sm text-gray-700">{{ formatDateTime(value) }}</span>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex items-center justify-end gap-2">
                    <button
                        class="inline-flex items-center gap-2 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        @click="restore(row.id)">
                        <i class="fa fa-rotate-left"></i>
                        Wiederherstellen
                    </button>

                    <button
                        class="inline-flex items-center gap-2 rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        @click="askForceDelete(row)">
                        <i class="fa fa-trash"></i>
                        Endgültig löschen
                    </button>
                </div>
            </template>
        </DataTable>

        <!-- Slide-Over (Endgültig löschen) -->
        <transition name="slide">
            <div v-if="confirm.open" class="fixed inset-0 z-1000" @keydown.esc="closeConfirm">
                <div class="absolute inset-0 bg-black/30" @click="closeConfirm" />
                <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-auto">
                    <h2 class="text-xl font-semibold mb-2">Endgültig löschen</h2>
                    <p class="text-sm text-gray-600">
                        Soll der Benutzer
                        <span class="font-semibold text-gray-900">„{{ confirm.name }}“</span>
                        wirklich <span class="font-semibold">endgültig</span> gelöscht werden?
                        Dieser Vorgang kann <span class="font-semibold">nicht</span> rückgängig gemacht werden.
                    </p>

                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button"
                            class="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                            @click="closeConfirm">
                            Abbrechen
                        </button>
                        <button
                            class="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            :disabled="confirm.submitting" @click="performForceDelete">
                            {{ confirm.submitting ? 'Löschen…' : 'Endgültig löschen' }}
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

type RowUserDeleted = {
    id: number
    name: string
    email: string
    deleted_at?: string
}

const users = ref<RowUserDeleted[]>([])

const columns: Column[] = [
    { key: 'name', label: 'Benutzer', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'email', label: 'E-Mail', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'deleted_at', label: 'Gelöscht am', headerClass: 'text-left', cellClass: 'text-left' },
    { key: 'actions', label: '', headerClass: 'text-right', cellClass: 'text-right' },
]

async function fetchDeleted() {
    try {
        const { data } = await axios.get('/api/users/deleted')
        users.value = (data || []).map((u: any) => ({
            id: Number(u.id),
            name: String(u.name ?? ''),
            email: String(u.email ?? ''),
            deleted_at: u.deleted_at,
        }))
    } catch {
        showToast({ key: 'users-deleted-fetch', message: 'Fehler beim Laden der gelöschten Benutzer', type: 'danger', duration: 3500, position: 'top-right' })
    }
}

async function restore(id: number) {
    try {
        await axios.put(`/api/users/${id}/restore`)
        showToast({ key: 'user-restored', message: 'Benutzer wiederhergestellt', type: 'success', duration: 2200, position: 'top-right' })
        await fetchDeleted()
    } catch {
        showToast({ key: 'user-restore-error', message: 'Wiederherstellen fehlgeschlagen', type: 'danger', duration: 3500, position: 'top-right' })
    }
}

// ---- Slide-Over: Force-Delete Bestätigung ----
const confirm = ref<{ open: boolean; submitting: boolean; id: number | null; name: string }>({
    open: false, submitting: false, id: null, name: ''
})
function askForceDelete(row: Record<string, any>) {
    confirm.value = {
        open: true,
        submitting: false,
        id: Number(row.id),
        name: String(row.name ?? '')
    }
}
function closeConfirm() { confirm.value.open = false }

async function performForceDelete() {
    if (!confirm.value.id) return
    confirm.value.submitting = true
    try {
        await axios.delete(`/api/users/${confirm.value.id}/force`)
        users.value = users.value.filter(u => u.id !== confirm.value!.id)
        showToast({ key: 'user-force-deleted', message: 'Benutzer endgültig gelöscht', type: 'success', duration: 2200, position: 'top-right' })
        closeConfirm()
    } catch {
        showToast({ key: 'user-force-error', message: 'Endgültiges Löschen fehlgeschlagen', type: 'danger', duration: 3500, position: 'top-right' })
    } finally {
        confirm.value.submitting = false
    }
}

function getInitials(name: string) {
    return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function formatDateTime(d?: string) {
    return d ? new Date(d).toLocaleString('de-DE') : '—'
}

onMounted(fetchDeleted)
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
