<template>
    <!-- <div class="grid grid-cols-1 sm:grid-cols-2 items-start gap-2"> -->
    <div class="flex flex-col">
        <!-- Label -->
        <div class="text-sm font-medium text-slate-700 dark:text-slate-200 pt-2">
            {{ label }}
        </div>

        <!-- Eingaben -->
        <div class="flex flex-col gap-2 w-full">
            <!-- Text + Picker -->
            <div class="flex items-center gap-3">
                <input type="text" :value="textValue" @input="onTextInput" :class="[
                    'h-8 rounded-lg border px-3 py-2 bg-white dark:bg-slate-950',
                    'border-slate-200 dark:border-slate-800',
                    'text-slate-800 dark:text-slate-100 placeholder:text-slate-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                    inputWidthClass || 'w-full sm:w-24 md:w-56'
                ]" placeholder="#RRGGBB, #RRGGBBAA oder rgba(255, 0, 0, 0.5)" />

                <!-- Native Farbwähler -->
                <button type="button" class="h-6 w-10 rounded-md border dark:border-slate-700 overflow-hidden"
                    :style="{ background: checkerBg }" :aria-label="`Farbe wählen (${normalizedCss})`">
                    <input type="color" :value="rgbHexNoAlpha" @input="onNativeColor"
                        class="h-6 w-10 cursor-pointer opacity-0" title="Farbe wählen" />
                    <div class="pointer-events-none h-10 w-10" :style="{ background: rgbCss }"></div>
                </button>
            </div>

            <!-- Alpha -->
            <div class="flex items-center gap-3">
                <label class="text-xs text-slate-600 dark:text-slate-300 w-10">Alpha</label>
                <input type="range" min="0" max="100" step="1" :value="Math.round(rgba.a * 100)" @input="onAlpha"
                    class="w-44" />
                <input type="number" min="0" max="100" step="1" :value="Math.round(rgba.a * 100)" @input="onAlphaNumber"
                    class="h-8 w-16 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 px-2" />
                <span class="text-xs text-slate-500">%</span>

                <!-- Live Chip -->
                <div
                    class="ml-auto inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div class="h-6 w-5" :style="{ background: checkerBg }"></div>
                    <div class="h-6 w-10 -ml-5" :style="{ background: normalizedCss }"></div>
                </div>

            </div>

            <p v-if="inputError" class="text-xs text-red-600">
                Ungültiges Format. Erlaubt: <code>#RGB</code>, <code>#RGBA</code>, <code>#RRGGBB</code>,
                <code>#RRGGBBAA</code>, <code>rgb(...)</code>, <code>rgba(...)</code>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue"

const props = defineProps<{
    modelValue?: string        // <-- darf undefined sein
    label: string
    inputWidthClass?: string
}>()

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>()

type RGBA = { r: number; g: number; b: number; a: number }

const clamp = (v: number, min = 0, max = 255) => Math.min(max, Math.max(min, v))

function hexToRgba(hex: string): RGBA | null {
    const h = (hex ?? "").replace(/^#/, "").trim()
    if (![3, 4, 6, 8].includes(h.length)) return null
    const to255 = (s: string): number => parseInt(s, 16)

    if (h.length === 3 || h.length === 4) {
        const rCh: string = h[0] ?? "0"
        const gCh: string = h[1] ?? "0"
        const bCh: string = h[2] ?? "0"
        const aCh: string | undefined = h[3]
        const r = to255(rCh + rCh)
        const g = to255(gCh + gCh)
        const b = to255(bCh + bCh)
        const a = aCh ? to255(aCh + aCh) / 255 : 1
        return { r, g, b, a }
    }

    const r = to255(h.slice(0, 2))
    const g = to255(h.slice(2, 4))
    const b = to255(h.slice(4, 6))
    const a = h.length === 8 ? to255(h.slice(6, 8)) / 255 : 1
    return { r, g, b, a }
}

function cssToRgba(css: string): RGBA | null {
    const s = (css ?? "").trim().toLowerCase()
    const rx =
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/
    const m = s.match(rx)
    if (!m) return null
    const [, rStr = "", gStr = "", bStr = "", aStr] = m
    const r = clamp(parseInt(rStr, 10))
    const g = clamp(parseInt(gStr, 10))
    const b = clamp(parseInt(bStr, 10))
    const a = aStr !== undefined ? Math.min(1, Math.max(0, parseFloat(aStr))) : 1
    return { r, g, b, a }
}

function parseColor(v?: string): RGBA | null {
    const val = (v ?? "").trim()
    if (!val) return null
    if (val.startsWith("#")) return hexToRgba(val)
    if (val.startsWith("rgb")) return cssToRgba(val)
    return null
}

function rgbaToHexNoA({ r, g, b }: RGBA): string {
    const h = (n: number) => n.toString(16).padStart(2, "0")
    return `#${h(clamp(r))}${h(clamp(g))}${h(clamp(b))}`
}

function rgbaToCss({ r, g, b, a }: RGBA): string {
    return a < 1
        ? `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${Math.round(a * 100) / 100})`
        : rgbaToHexNoA({ r, g, b, a })
}

const state = reactive<{ rgba: RGBA; text: string; invalid: boolean }>({
    rgba: parseColor(props.modelValue) ?? { r: 255, g: 153, b: 0, a: 1 },
    text: (props.modelValue ?? "#ff9900"),
    invalid: false,
})

watch(
    () => props.modelValue,
    (v) => {
        const parsed = parseColor(v)
        if (parsed) {
            state.rgba = parsed
            state.text = v ?? ""
            state.invalid = false
        } else {
            state.text = v ?? ""
            state.invalid = (v ?? "").trim().length > 0 ? true : false
        }
    }
)

const rgba = computed<RGBA>(() => state.rgba)
const textValue = computed<string>(() => state.text)
const inputError = computed<boolean>(() => state.invalid)

const rgbHexNoAlpha = computed<string>(() => rgbaToHexNoA(rgba.value))
const rgbCss = computed<string>(() => `rgb(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b})`)
const normalizedCss = computed<string>(() => rgbaToCss(rgba.value))

const checkerBg = computed<string>(
    () => "conic-gradient(#ccc 25%, transparent 0 50%, #ccc 0 75%, transparent 0) 0 0/8px 8px"
)

function commit(v: RGBA) {
    const css = rgbaToCss(v)
    state.rgba = v
    state.text = css
    state.invalid = false
    emit("update:modelValue", css)
}

function onNativeColor(e: Event) {
    const hex = (e.target as HTMLInputElement).value ?? ""
    const rgb = hexToRgba(hex)
    if (!rgb) return
    commit({ ...rgb, a: rgba.value.a })
}

function onAlpha(e: Event) {
    const valStr = (e.target as HTMLInputElement).value ?? "0"
    const val = Number(valStr)
    const a = Math.min(1, Math.max(0, val / 100))
    commit({ ...rgba.value, a })
}

function onAlphaNumber(e: Event) {
    const valStr = (e.target as HTMLInputElement).value ?? "0"
    const raw = Number(valStr)
    const pct = Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0))
    commit({ ...rgba.value, a: pct / 100 })
}

function onTextInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value ?? ""
    state.text = raw
    const parsed = parseColor(raw)
    if (parsed) commit(parsed)
    else state.invalid = raw.trim().length > 0
}
</script>
