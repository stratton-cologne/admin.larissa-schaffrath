import type { AxiosError } from "axios";
import { i18n } from "@/i18n";

type ApiErrorPayload =
    | {
          message?: string;
          error?: string;
          errors?: Record<string, string[] | string> | string[] | string;
      }
    | string
    | undefined;

export function isAxiosError<T = unknown>(e: unknown): e is AxiosError<T> {
    return !!e && typeof e === "object" && "isAxiosError" in (e as any);
}

function fromValidationErrors(errs: ApiErrorPayload): string | null {
    if (!errs) return null;
    if (typeof errs === "string") return errs;
    const container = (errs as any).errors ?? errs;
    if (typeof container === "string") return container;

    if (Array.isArray(container)) {
        const first = container[0];
        return typeof first === "string" ? first : null;
    }

    if (typeof container === "object") {
        const firstKey = Object.keys(container)[0];
        if (!firstKey) return null;
        const val = (container as any)[firstKey];
        if (Array.isArray(val))
            return typeof val[0] === "string" ? val[0] : null;
        if (typeof val === "string") return val;
    }
    return null;
}

export function humanizeAxiosError(e: unknown): {
    message: string;
    status?: number;
    code?: string;
} {
    const t = i18n.global.t;

    if (!isAxiosError(e)) {
        return { message: t("toast.http.unknown") as string };
    }

    const { response, code } = e;
    const status = response?.status;
    const apiMsg =
        (response?.data && (response.data as any).message) ||
        (response?.data && (response.data as any).error) ||
        fromValidationErrors(response?.data as ApiErrorPayload);

    if (apiMsg && typeof apiMsg === "string") {
        return { message: apiMsg, status, code };
    }

    // Translate by status
    if (status && t(`toast.http.${status}`) !== `toast.http.${status}`) {
        return { message: t(`toast.http.${status}`) as string, status, code };
    }

    if (code === "ECONNABORTED") {
        return { message: t("toast.http.timeout") as string, status, code };
    }

    if (!status) {
        return { message: t("toast.http.network") as string, status, code };
    }

    return { message: t("toast.http.unknown") as string, status, code };
}

export function errorToastKey(status?: number, code?: string) {
    if (status) return `http-${status}`;
    if (code) return `http-${code.toLowerCase()}`;
    return "http-error";
}
