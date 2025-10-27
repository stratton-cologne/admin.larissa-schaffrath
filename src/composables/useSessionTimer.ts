// frontend/src/composables/useSessionTimer.ts
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "@/lib/axios";
import { decodeJwt } from "@/utils/jwt";

function readBearerFromAxios(): string | null {
    // defensiv: common kann fehlen, Authorization kann non-string sein
    const common = axios.defaults.headers.common as
        | Record<string, unknown>
        | undefined;
    const auth =
        common && typeof common["Authorization"] === "string"
            ? (common["Authorization"] as string)
            : null;

    if (!auth) return null;

    const m = /^Bearer\s+(.+)$/.exec(auth);
    return m && typeof m[1] === "string" ? m[1] : null;
}

// Falls du dein Token in Storage hältst, ergänze hier deine Keys:
const STORAGE_KEYS = ["access_token", "token", "jwt"];

function readToken(): string | null {
    const fromAxios = readBearerFromAxios();
    if (fromAxios) return fromAxios;

    for (const k of STORAGE_KEYS) {
        const v = localStorage.getItem(k) ?? sessionStorage.getItem(k);
        if (v) return v;
    }
    return null;
}

export function useSessionTimer(pollMs = 1000) {
    const now = ref(Date.now());
    const expMs = ref<number | null>(null);
    const hasToken = ref(false);

    const remainingMs = computed(() => {
        if (expMs.value == null) return 0;
        return Math.max(0, expMs.value - now.value);
    });

    const remainingSec = computed(() => Math.floor(remainingMs.value / 1000));
    const isExpiringSoon = computed(
        () => remainingSec.value <= 5 * 60 && remainingSec.value > 0,
    );
    const isExpired = computed(() => remainingSec.value === 0);

    function syncFromToken() {
        const token = readToken();
        hasToken.value = !!token;
        if (!token) {
            expMs.value = null;
            return;
        }
        const payload = decodeJwt(token);
        expMs.value = payload?.exp ? payload.exp * 1000 : null;
    }

    let t: number | undefined;
    function start() {
        stop();
        t = window.setInterval(() => (now.value = Date.now()), pollMs);
        syncFromToken();
    }
    function stop() {
        if (t) window.clearInterval(t);
        t = undefined;
    }

    function storageListener() {
        syncFromToken();
    }

    onMounted(() => {
        start();
        window.addEventListener("storage", storageListener);
    });
    onBeforeUnmount(() => {
        stop();
        window.removeEventListener("storage", storageListener);
    });

    return { hasToken, remainingSec, isExpiringSoon, isExpired, syncFromToken };
}
