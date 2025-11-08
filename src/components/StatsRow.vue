<template>
    <div class="flex flex-wrap -mx-3 gab-6">
        <div v-for="(card, idx) in cards" :key="idx"
            class="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none  xl:w-1/4">
            <div
                class="relative flex flex-col min-w-0 wrap-break-word bg-white shadow-soft-xl rounded-2xl bg-clip-border">
                <div class="flex-auto p-4">
                    <div class="flex flex-row -mx-3">
                        <div class="flex-none w-2/3 max-w-full px-3">
                            <div>
                                <p class="mb-0 font-sans text-sm font-semibold leading-normal">{{ card.label }}</p>
                                <h5 class="mb-0 font-bold">
                                    {{ card.value }}
                                    <span v-if="card.delta" class="text-sm leading-normal font-weight-bolder"
                                        :class="card.deltaColor || 'text-lime-500'">
                                        {{ card.delta }}
                                    </span>
                                </h5>
                            </div>
                        </div>
                        <div class="px-3 text-right basis-1/3">
                            <div class="flex items-center justify-center ml-auto w-12 h-12 rounded-lg"
                                :class="card.iconBg || 'bg-linear-to-tl from-primary-700 to-primary-500'">
                                <UiIcon :name="card.icon" class="w-6 h-6 text-lg relative text-white leading-none"
                                    color="#ffffff" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon as UiIcon } from '@stratton-cologne/ui'

type StatCard = {
    label: string
    value: string | number
    delta?: string
    deltaColor?: string // Tailwind color class
    icon: string        // e.g. 'ni-money-coins'
    iconBg?: string     // gradient classes
}

defineProps<{ cards: StatCard[] }>()

</script>
