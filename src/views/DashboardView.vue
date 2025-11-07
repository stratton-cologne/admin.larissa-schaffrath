<template>
    <div class="w-full px-6 py-6 mx-auto">

        <div class="w-full px-6 py-6 mx-auto">
            <!-- Row 1 -->
            <StatsRow :cards="statCards" />
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { fetchAnalyticsSummary, type AnalyticsSummary } from '@/api/analytics'

import StatsRow from '@/components/StatsRow.vue'

/** ----- Row 1 ----- */
type Card = { label: string; value: string | number; delta?: string; deltaColor?: string; icon: string; iconBg?: string }
const statCards = ref<Card[]>([
    { label: 'Heutige Aufrufe', value: '—', icon: 'eye' },
    { label: 'Aufrufe (Monat)', value: '—', icon: 'chart-bar' },
    { label: 'Ø Verweildauer', value: '—', icon: 'timer' },
    { label: 'Unique Sessions (Monat)', value: '—', icon: 'mouse-pointer' },
])

function fmtDuration(sec: number) {
    if (!sec || sec <= 0) return '0s'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return m ? `${m}m ${s}s` : `${s}s`
}

async function loadAnalytics() {
    const a = await fetchAnalyticsSummary()
    statCards.value = [
        { label: 'Heutige Aufrufe', value: a.todayViews, /* delta usw. */ icon: 'eye' },
        { label: 'Aufrufe (Monat)', value: a.monthViews, icon: 'chart-bar' },
        { label: 'Ø Verweildauer', value: fmtDuration(a.avgDurationSec), icon: 'timer' },
        { label: 'Unique Sessions (Monat)', value: a.uniqueSessionsMonth ?? 0, icon: 'mouse-pointer' },
        { label: 'Unique IPs (Heute)', value: a.uniqueIPsToday ?? 0, icon: 'globe' },
        { label: 'Unique IPs (Monat)', value: a.uniqueIPsMonth ?? 0, icon: 'server' },
    ]

}

onMounted(loadAnalytics)
</script>
