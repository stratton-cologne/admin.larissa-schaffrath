// src/lib/axios.ts
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import router from "@/router";
import { useToast } from "@stratton-cologne/vue-smart-toast";
import { env } from "@/lib/env";
import { i18n } from "@/i18n";
import { humanizeAxiosError, errorToastKey, isAxiosError } from "@/lib/http";
import { useAuthStore } from "@/stores/auth";

const duration = 3500;

declare module "axios" {
    export interface AxiosRequestConfig {
        meta?: {
            silent?: boolean;
            toastKey?: string;
            successToast?: string | boolean;
            position?:
                | "top-right"
                | "top-left"
                | "bottom-right"
                | "bottom-left";
            duration?: number;
        };
    }
}

const instance = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 30_000,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)["Authorization"] =
            `Bearer ${token}`;
    }
    return config;
});

// Debounce gegen Mehrfach-Redirects/Toasts bei parallelen 401ern
let isHandling401 = false;

instance.interceptors.response.use(
    (response) => {
        const meta = (response.config as AxiosRequestConfig).meta;
        if (meta?.successToast) {
            const { showToast } = useToast();
            const t = i18n.global.t;
            const msg =
                typeof meta.successToast === "string"
                    ? meta.successToast
                    : (t("toast.http.success") as string);
            console.log("showing success toast:", msg);
            showToast({
                key: meta.toastKey ?? "http-success",
                message: msg,
                type: "success",
                duration: meta.duration ?? duration,
                position: meta.position ?? "top-right",
            });
        }
        return response;
    },

    async (error: AxiosError | unknown) => {
        const cfg = isAxiosError(error)
            ? ((error as AxiosError).config as AxiosRequestConfig | undefined)
            : undefined;
        const meta = cfg?.meta;

        if (isAxiosError(error) && error.response?.status === 401) {
            // Token & User IMMER im Store leeren – nicht nur localStorage
            const auth = useAuthStore();
            auth.clearAuth();

            // Einmaliger Redirect + Toast
            if (!isHandling401) {
                isHandling401 = true;
                try {
                    if (!meta?.silent) {
                        const { showToast } = useToast();
                        const t = i18n.global.t;
                        showToast({
                            key: "auth-401",
                            message: t("toast.http.401") as string, // „Sitzung abgelaufen“ etc.
                            type: "error",
                            duration: meta?.duration ?? duration,
                            position: meta?.position ?? "top-right",
                        });
                    }

                    // Falls wir nicht bereits auf SignIn sind → weiterleiten, inkl. Rückkehr-URL
                    const current = router.currentRoute.value;
                    if (current.name !== "SignIn") {
                        const redirect = current.fullPath || "/";
                        await router.push({
                            name: "SignIn",
                            query: { redirect },
                        });
                    }
                } finally {
                    // nach kurzem Tick wieder freigeben
                    setTimeout(() => (isHandling401 = false), 300);
                }
            }

            return Promise.reject(error);
        }

        if (!meta?.silent) {
            const { message, status, code } = humanizeAxiosError(error);
            const { showToast } = useToast();
            showToast({
                key: meta?.toastKey ?? errorToastKey(status, code),
                message,
                type: "error",
                duration: meta?.duration ?? duration,
                position: meta?.position ?? "top-right",
            });
        }

        return Promise.reject(error);
    },
);

export default instance;
