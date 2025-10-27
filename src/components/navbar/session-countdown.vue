<!-- src/components/nav/SessionCountdown.vue -->
<template>
    <div v-if="hasToken" class="flex items-center gap-2">
        <span class="text-sm text-slate-500">Sitzung:</span>

        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="badgeClass">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                aria-hidden="true">
                <path
                    d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1Zm1 11.59V6a1 1 0 0 0-2 0v7a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414Z" />
            </svg>

            {{ isExpired ? 'abgelaufen' : label }}
        </span>
    </div>
</template>

<script setup lang="ts">
/**
 * @file SessionCountdown.vue
 * @brief Zeigt verbleibende Sitzungszeit als Badge (h/m/s) mit Statusfarbe.
 * @details
 *  - Nutzt `useSessionTimer(intervalMs)` für Token-Status & Restlaufzeit.
 *  - Farbcode: grün (ok), amber (läuft bald ab), rot (abgelaufen).
 */

import { computed } from 'vue'
import { useSessionTimer } from '@/composables/useSessionTimer'

defineOptions({ name: 'SessionCountdown' })

/* ============================================================================
 * Timer-Hooks
 * ==========================================================================*/

/**
 * @brief Polling-Intervall 1000 ms für eine Sekundengenauigkeit.
 * @note `useSessionTimer` liefert:
 *   - `hasToken`: ob ein gültiges Token vorhanden ist
 *   - `remainingSec`: verbleibende Zeit in Sekunden
 *   - `isExpiringSoon`: Schwellenwert-nahe Ablaufwarnung
 *   - `isExpired`: bereits abgelaufen
 */
const { hasToken, remainingSec, isExpiringSoon, isExpired } = useSessionTimer(1000)

/* ============================================================================
 * Darstellung
 * ==========================================================================*/

/**
 * @brief Menschlich lesbares Zeitlabel (h m / m s / s).
 */
const label = computed<string>(() => {
    const sec = Math.max(0, remainingSec.value | 0)
    const m = Math.floor(sec / 60)
    const s = sec % 60
    const h = Math.floor(m / 60)
    const mm = m % 60

    if (h > 0) return `${h}h ${mm}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
})

/**
 * @brief Badge-Farbklassen basierend auf Status.
 */
const badgeClass = computed<string>(() => {
    if (isExpired.value) return 'bg-red-600 text-white'
    if (isExpiringSoon.value) return 'bg-amber-500 text-black'
    return 'bg-emerald-600 text-white'
})
</script>
