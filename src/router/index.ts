import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { useAuthStore } from "@/stores/auth";

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

export default router;
