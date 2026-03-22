import { createRouter, createWebHistory } from "vue-router";

export const routes = [
  {
    path: "/",
    component: () => import("../views/public/HomeView.vue"),
  },
  {
    path: "/products",
    component: () => import("../views/public/ProductCatalogView.vue"),
  },
  {
    path: "/products/:id",
    component: () => import("../views/public/ProductDetailView.vue"),
  },
  {
    path: "/admin",
    redirect: "/admin/products",
    meta: { requiresAuth: true },
    children: [
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
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Auth navigation guard
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: "/login" };
  }
});

export default router;
