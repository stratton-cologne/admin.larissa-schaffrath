import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import router from "@/router";
import { useToast } from "@stratton-cologne/vue-smart-toast";
import { env } from "@/lib/env";
import { i18n } from "@/i18n";
import { humanizeAxiosError, errorToastKey, isAxiosError } from "@/lib/http";

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

    (error: AxiosError | unknown) => {
        const cfg = isAxiosError(error)
            ? (error.config as AxiosRequestConfig | undefined)
            : undefined;
        const meta = cfg?.meta;

        if (isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem("token");
            router.push({ name: "SignIn" });
            if (!meta?.silent) {
                const { showToast } = useToast();
                const t = i18n.global.t;
                showToast({
                    key: "auth-401",
                    message: t("toast.http.401") as string,
                    type: "error",
                    duration: meta?.duration ?? duration,
                    position: meta?.position ?? "top-right",
                });
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
