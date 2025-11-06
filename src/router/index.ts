import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { mainRoles, adminOnly, superAdmin, hasAccess } from "@/types/roles";

import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/composables/useTheme";

/** =========================
 *   VIEWS (Lazy Loaded)
 * ========================= */
// Auth
const SignIn = () => import("@/views/auth/SignInView.vue");
// Übersicht
const Dashboard = () => import("@/views/DashboardView.vue");
// Webseite (Content)
// Webseite (Content)
const GalleriesList = () =>
    import("@/views/website/galleries/GalleriesListView.vue");
const GalleryDetail = () =>
    import("@/views/website/galleries/GalleryDetailView.vue");
const PortfolioEdit = () =>
    import("@/views/website/portfolio/PortfolioEditView.vue");
const ContactEdit = () => import("@/views/website/contact/ContactEditView.vue");

const LegalPages = () =>
    import("@/views/website/legalTerms/LegalPagesView.vue");
const ClientBranding = () =>
    import("@/views/website/settings/ClientBrandingView.vue");
// Mediathek
const MediaLibrary = () => import("@/views/media/MediaLibraryView.vue");
const MediaDeleted = () => import("@/views/media/MediaDeletedView.vue");
// Benutzer
const UsersList = () => import("@/views/users/UsersListView.vue");
const UsersDeleted = () => import("@/views/users/UsersDeletedView.vue");
// Einstellungen
const Settings = () => import("@/views/settings/SettingsView.vue");

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
        breadcrumb?: Array<{ label: string; to?: string }>;
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
            breadcrumb: [{ label: "Home", to: "/" }, { label: "Dashboard" }],
        },
    },
    /** 4) Webseite (Content) */
    {
        path: "/content/client-branding",
        name: "ClientBranding",
        component: ClientBranding,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            sidebar: {
                title: "Branding",
                section: "Webseite",
                icon: "portfolio",
                sectionOrder: 3,
                order: 1,
            },
            breadcrumb: [
                { label: "Content", to: "/content" },
                { label: "Branding" },
            ],
        },
    },
    {
        path: "/content/galleries",
        name: "GalleriesList",
        component: GalleriesList,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            title: "Galerien",
            sidebar: {
                title: "Galerien",
                icon: "images",
                section: "Webseite",
                sectionOrder: 3,
                order: 2,
            },
            breadcrumb: [
                { label: "Content", to: "/content/galleries" },
                { label: "Galerien" },
            ],
        },
    },
    {
        path: "/content/galleries/:id",
        name: "GalleryDetail",
        component: GalleryDetail,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            title: "Gallerie Detail",
            sidebar: {
                hidden: true,
                section: "Webseite",
                sectionOrder: 3,
            },
            breadcrumb: [
                { label: "Content", to: "/content/galleries" },
                { label: "Galleries", to: "/content/galleries" },
                { label: "Detail" },
            ],
        },
    },
    {
        path: "/content/portfolio",
        name: "PortfolioEdit",
        component: PortfolioEdit,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            title: "Portfolio",
            sidebar: {
                title: "Portfolio",
                section: "Webseite",
                icon: "portfolio",
                sectionOrder: 3,
                order: 3,
            },
            breadcrumb: [
                { label: "Content", to: "/content/portfolio" },
                { label: "Portfolio" },
            ],
        },
    },
    {
        path: "/content/contact",
        name: "ContactEdit",
        component: ContactEdit,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            title: "Kontakt",
            sidebar: {
                title: "Kontakt",
                section: "Webseite",
                icon: "contact",
                sectionOrder: 3,
                order: 4,
            },
            breadcrumb: [
                { label: "Content", to: "/content/contact" },
                { label: "Kontakt" },
            ],
        },
    },
    {
        path: "/settings/legal",
        name: "LegalPages",
        component: LegalPages,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            title: "Rechtstexte",
            sidebar: {
                title: "Rechtstexte",
                section: "Webseite",
                icon: "portfolio",
                sectionOrder: 3,
                order: 5,
            },
        },
    },
    /** 5) Mediathek */
    {
        path: "/media/list",
        name: "MediaList",
        component: MediaLibrary,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            sidebar: {
                title: "Mediathek",
                icon: "image",
                section: "Mediathek",
                sectionOrder: 4,
                order: 1,
            },
        },
    },
    {
        path: "/media/deleted",
        name: "MediaDeleted",
        component: MediaDeleted,
        meta: {
            requiresAuth: true,
            roles: mainRoles,
            sidebar: {
                title: "Papierkorb",
                icon: "trash",
                section: "Mediathek",
                sectionOrder: 4,
                order: 2,
            },
        },
    },
    /** 6) Verwaltung (Benutzer) */
    {
        path: "/users/list",
        name: "UsersList",
        component: UsersList,
        meta: {
            requiresAuth: true,
            roles: superAdmin,
            sidebar: {
                title: "Benutzer",
                icon: "users",
                section: "Verwaltung",
                sectionOrder: 2,
                order: 1,
            },
        },
    },
    {
        path: "/users/deleted",
        name: "UsersDeleted",
        component: UsersDeleted,
        meta: {
            requiresAuth: true,
            roles: superAdmin,
            sidebar: {
                title: "Gelöschte Benutzer",
                icon: "user-delete",
                section: "Verwaltung",
                sectionOrder: 2,
                order: 2,
            },
        },
    },
    /** 7) Account/Einstellungen (superAdmin wo nötig) */
    {
        path: "/settings",
        name: "Settings",
        component: Settings,
        meta: {
            requiresAuth: true,
            roles: adminOnly,
            sidebar: {
                title: "Branding & Einstellungen",
                icon: "settings",
                section: "Einstellungen",
                sectionOrder: 99,
                order: 1,
            },
            breadcrumb: [
                { label: "Home", to: "/" },
                { label: "Branding & Einstellungen" },
            ],
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
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const settings = useSettingsStore();
    const { applyTheme } = useTheme();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // If the route requires authentication and the user is not authenticated,
        // redirect to the SignIn page.
        next({ name: "SignIn" });
    } else {
        // Otherwise, allow navigation.
        if (authStore.token) {
            await settings.load();
            if (settings.settings?.theme) applyTheme(settings.settings.theme);
        }
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
