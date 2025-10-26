export type AppRole = "user" | "admin" | "manager";

/** Standard-Sets */
export const mainRoles: AppRole[] = ["user", "admin", "manager"];
export const adminOnly: AppRole[] = ["admin", "user"];
export const superAdmin: AppRole[] = ["admin"];

/** Rolle(n) des aktuellen Users ermitteln.
 *  - bevorzugt aus einem Store (falls vorhanden),
 *  - sonst aus localStorage ("roles": string[]),
 *  - Fallback: ["user"].
 */
export function resolveUserRoles(): AppRole[] {
    try {
        // Wenn du einen Auth-Store hast, hier preferiert nutzen:
        // const store = useAuthStore()
        // return (store.roles as AppRole[]) ?? ['user']

        const raw = localStorage.getItem("roles");
        if (!raw) return ["user"];
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
            // primitive Validierung
            return arr.filter((r) =>
                ["user", "admin", "manager"].includes(r),
            ) as AppRole[];
        }
        return ["user"];
    } catch {
        return ["user"];
    }
}

/** Zugriff prüfen: mind. eine Überschneidung zwischen required und current */
export function hasAccess(
    required: AppRole[] | undefined,
    current: AppRole[],
): boolean {
    if (!required || required.length === 0) return true;
    return required.some((r) => current.includes(r));
}
