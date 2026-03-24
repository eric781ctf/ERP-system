import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

export const routes = [
  {
    path: "/",
    component: () => import("../views/layout/PublicLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("../views/public/HomeView.vue"),
      },
      {
        path: "products",
        component: () => import("../views/public/ProductCatalogView.vue"),
      },
      {
        path: "products/:id",
        component: () => import("../views/public/ProductDetailView.vue"),
      },
      {
        path: "about",
        component: () => import("../views/public/AboutView.vue"),
      },
    ],
  },
  {
    path: "/login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/admin",
    component: () => import("../views/layout/AdminLayout.vue"),
    redirect: "/admin/help-center",
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        component: () => import("../views/admin/DashboardView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "products",
        component: () => import("../views/admin/AdminProductListView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "products/new",
        component: () => import("../views/admin/AdminProductEditView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "products/:id/edit",
        component: () => import("../views/admin/AdminProductEditView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "contacts",
        component: () => import("../views/admin/ContactsView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "banners",
        component: () => import("../views/admin/AdminBannerView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "catalog-hero",
        component: () => import("../views/admin/AdminCatalogHeroView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "help-center",
        component: () => import("../views/admin/HelpCenterView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "about-us",
        component: () => import("../views/admin/AdminAboutUsView.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Auth navigation guard
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    authStore.redirectPath = to.fullPath;
    return { path: "/login" };
  }

  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return { path: "/admin/help-center" };
  }
});

export default router;
