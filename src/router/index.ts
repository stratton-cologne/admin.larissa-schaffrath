import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { mainRoles, adminOnly, superAdmin, hasAccess } from "@/types/roles";

import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

/** =========================
 *   VIEWS (Lazy Loaded)
 * ========================= */
// Auth
const SignIn = () => import("@/views/auth/SignInView.vue");
// Übersicht
const Dashboard = () => import("@/views/DashboardView.vue");

declare module "vue-router" {
    interface RouteMeta {
        requiresAuth?: boolean;
        sidebar?: {
            title?: string;
            icon?: string;
            section?: string;
            sectionOrder?: number;
            order?: number;
            hidden?: boolean;
        };
    }
}

/** =========================
 *   ROUTES (sinnvoll sortiert)
 * ========================= */
export const routes: RouteRecordRaw[] = [
    /** 1) Auth */
    {
        path: "/signin",
        name: "SignIn",
        component: SignIn,
        meta: {
            requiresAuth: false,
            sidebar: {
                title: "Anmelden",
                icon: "login",
                hidden: true,
                section: "Auth",
                sectionOrder: 99,
                order: 1,
            },
        },
    },

    /** 2) Redirect Root → Übersicht */
    {
        path: "/",
        redirect: "/dashboard",
    },

    /** 3) Übersicht */
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            sidebar: {
                title: "Dashboard",
                icon: "home",
                section: "Übersicht",
                sectionOrder: 1,
                order: 1,
            },
        },
    },
];

/** =========================
 *   ROUTER INSTANCE
 * ========================= */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(_to, _from, saved) {
        return saved ?? { left: 0, top: 0 };
    },
});

/** =========================
 *   NAVIGATION GUARDS
 * ========================= */
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // If the route requires authentication and the user is not authenticated,
        // redirect to the SignIn page.
        next({ name: "SignIn" });
    } else {
        // Otherwise, allow navigation.
        next();
    }
});

// After each (Titel, Telemetrie, etc.)
router.afterEach((to) => {
    const ui = useUiStore();
    ui.closeOnMobile();

    const title =
        to.meta?.title ?? (typeof to.name === "string" ? to.name : "App");

    const appTitle =
        import.meta.env.VITE_APP_TITLE ||
        document
            .querySelector('meta[name="application-name"]')
            ?.getAttribute("content") ||
        document.title ||
        "App";

    document.title = `${title} · ${appTitle}`;
});

export default router;
