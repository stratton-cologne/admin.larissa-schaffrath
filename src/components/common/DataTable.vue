<!-- src/components/common/DataTable.vue -->
<template>
    <div
        class="relative flex min-w-0 flex-col wrap-break-word rounded-2xl border-0 bg-white bg-clip-border shadow-soft-xl dark:bg-gray-950 dark:shadow-soft-dark-xl">
        <div class="overflow-x-auto">
            <table class="w-full items-center align-top text-slate-500 dark:border-white/40">
                <thead>
                    <tr class="align-bottom">
                        <th v-for="col in columns" :key="col.key"
                            class="text-xxs shadow-none whitespace-nowrap px-6 py-3 font-bold uppercase tracking-none
                       bg-transparent text-slate-400 opacity-70 border-b border-solid border-gray-200 dark:border-white/40 dark:text-white dark:opacity-80"
                            :class="col.headerClass">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>

                <tbody class="border-t-2 border-solid border-current dark:border-white/40">
                    <tr v-for="(row, rIdx) in rows" :key="row[idKey] ?? rIdx">
                        <td v-for="col in columns" :key="col.key"
                            class="whitespace-nowrap bg-transparent p-2 align-middle text-sm dark:border-white/40"
                            :class="col.cellClass">
                            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :col="col">
                                <!-- Default-Renderer -->
                                <span class="leading-normal" :class="col.align === 'center' ? 'block text-center' : ''">
                                    {{ row[col.key] }}
                                </span>
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!rows?.length" class="px-6 py-10 text-center text-sm text-slate-400">
                {{ emptyText }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
export type Column = {
    key: string
    label: string
    headerClass?: string
    cellClass?: string
    align?: 'left' | 'center' | 'right'
}

withDefaults(defineProps<{
    idKey?: string
    columns: Column[]
    rows: Record<string, any>[]
    emptyText?: string
}>(), {
    idKey: 'id',
    emptyText: 'No data',
})
</script>
