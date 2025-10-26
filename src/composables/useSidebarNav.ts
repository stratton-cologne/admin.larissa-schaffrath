/**
 * @file useSidebarNav.ts
 * @brief Leitet Navigationsgruppen für die Sidebar aus den Router-Routen ab.
 * @details
 *  - Liest Routen mit `meta.sidebar` aus und bildet strukturierte Gruppen.
 *  - Berücksichtigt Authentifizierung, Rollen und Sichtbarkeits-Flags.
 *  - Sortiert Abschnitte und Items stabil nach `sectionOrder`/`order`/Titel.
 */

import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

/* ============================================================================
 * Typen
 * ==========================================================================*/

/** @brief App-weite Rollen (einfaches Union, genügt für die Sidebar-Filterung). */
export type AppRole = "guest" | "user" | "admin" | "manager";

/** @brief Metadaten für Sidebar-Einträge an einer Route. */
type SidebarMeta = {
    title: string;
    /** @brief Icon-Name; wird im UI via <UiIcon> aufgelöst. */
    icon?: string;
    section?: string;
    sectionOrder?: number;
    order?: number;
    hidden?: boolean;
    /** @brief Optionaler Rollenfilter (Fallback, falls `meta.roles` nicht gesetzt ist). */
    roles?: AppRole[];
};

/** @brief Flaches Item innerhalb einer Section-Gruppe. */
type GroupItem = {
    path: string;
    title: string;
    icon?: string;
    order: number;
    sectionOrder: number;
};

/** @brief Gruppierte Darstellung für die Sidebar. */
type Group = {
    section: string;
    sectionOrder: number;
    items: GroupItem[];
};

/** @brief Internes Record-Format vor dem Gruppieren. */
type RecordItem = GroupItem & { section: string };

/* ============================================================================
 * Hilfsfunktionen
 * ==========================================================================*/

/**
 * @brief Prüft, ob zwei Mengen einen Schnitt haben.
 * @param a Erstes Array.
 * @param b Zweites Array.
 * @returns `true`, wenn mind. ein gemeinsames Element existiert.
 */
function intersect<T>(a: T[], b: T[]): boolean {
    const s = new Set(a);
    return b.some((x) => s.has(x));
}

/**
 * @brief Normalisiert Rollenwerte aus beliebigen Quellen (String/Array/Mix).
 * @param input Beliebiger Eingabewert (z. B. aus dem Backend).
 * @returns Eindeutige Liste normalisierter App-Rollen.
 */
function normalizeRoles(input: unknown): AppRole[] {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    const out: AppRole[] = [];

    for (const r of arr) {
        const v = String(r).toLowerCase().trim();
        if (["admin", "role_admin", "administrator"].includes(v))
            out.push("admin");
        else if (["manager", "role_manager"].includes(v)) out.push("manager");
        else if (["user", "role_user", "member"].includes(v)) out.push("user");
        else if (["guest"].includes(v)) out.push("guest");
    }

    return Array.from(new Set(out)) as AppRole[];
}

/* ============================================================================
 * Composable
 * ==========================================================================*/

/**
 * @brief Liefert gruppierte Sidebar-Navigation und die ermittelten Rollen.
 * @returns { groups, currentRoles }
 */
export function useSidebarNav() {
    const router = useRouter();
    const auth = useAuthStore();

    /**
     * @brief Aktuelle Rollen des Users.
     * @details
     *  - Liest `user.roles` bzw. `user.role` und normalisiert.
     *  - Fallback: wenn eingeloggt → `['user']`, sonst `['guest']`.
     */
    const currentRoles = computed<AppRole[]>(() => {
        const fromUser =
            (auth.user as any)?.roles ?? (auth.user as any)?.role ?? null;
        const normalized = normalizeRoles(fromUser);
        if (normalized.length) return normalized;
        return auth.isAuthenticated
            ? (["user"] as AppRole[])
            : (["guest"] as AppRole[]);
    });

    /**
     * @brief Gruppierte, gefilterte und sortierte Sidebar-Routen.
     * @details
     *  Schritte:
     *   1) Routen mit `meta.sidebar` filtern.
     *   2) Records erzeugen (Auth/Rollen/Hidden/SignIn/Path prüfen).
     *   3) Nach Section gruppieren.
     *   4) Items und Sections sortieren.
     */
    const groups = computed<Group[]>(() => {
        // (1) Relevante Routen holen
        const routes = router.getRoutes().filter((r) => !!r.meta?.sidebar);

        // (2) Record-Format erzeugen und filtern
        const records: RecordItem[] = [];

        for (const r of routes) {
            const sb = r.meta!.sidebar as SidebarMeta;
            if (sb.hidden) continue;

            // SignIn / explizit öffentliche Side-Entry vermeiden
            if (r.name === "SignIn") continue;

            // requiresAuth: nur für eingeloggte Nutzer anzeigen
            if (r.meta?.requiresAuth && !auth.isAuthenticated) continue;

            // Rollen: meta.roles hat Vorrang vor sidebar.roles, sonst Default für eingeloggte
            const routeRoles =
                (r.meta?.roles as AppRole[] | undefined) ??
                (sb.roles as AppRole[] | undefined) ??
                (["user", "admin", "manager"] as AppRole[]);

            if (!intersect(routeRoles, currentRoles.value)) continue;

            // Pfad brauchbar?
            if (!r.path || r.path === "*" || r.path === "/*") continue;

            records.push({
                path: r.path,
                title: sb.title ?? String(r.name ?? r.path),
                icon: sb.icon,
                order: sb.order ?? 999,
                sectionOrder: sb.sectionOrder ?? 999,
                section: sb.section ?? "Sonstiges",
            });
        }

        // (3) Gruppieren nach Section
        const map = new Map<string, GroupItem[]>();
        for (const item of records) {
            const { section, ...entry } = item;
            if (!map.has(section)) map.set(section, []);
            map.get(section)!.push(entry);
        }

        // (4) Sortierung: Items nach order, dann Titel; Sections nach sectionOrder, dann Name
        const result: Group[] = Array.from(map.entries()).map(
            ([section, items]) => {
                items.sort((a, b) =>
                    a.order !== b.order
                        ? a.order - b.order
                        : a.title.localeCompare(b.title, "de"),
                );
                const secOrder = items[0]?.sectionOrder ?? 999;
                return { section, sectionOrder: secOrder, items };
            },
        );

        result.sort((a, b) =>
            a.sectionOrder !== b.sectionOrder
                ? a.sectionOrder - b.sectionOrder
                : a.section.localeCompare(b.section, "de"),
        );

        return result;
    });

    return { groups, currentRoles };
}
