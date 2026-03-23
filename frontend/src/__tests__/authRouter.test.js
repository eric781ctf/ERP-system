/**
 * Task 7.3 — Navigation Guard 測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../stores/auth.js";

vi.mock("../api/auth.js", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
}));

// Build a test router with the same guard logic as the real router
function buildRouter(authStore) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/login", component: { template: "<div/>" }, meta: { requiresGuest: true } },
      { path: "/products", component: { template: "<div/>" } },
      {
        path: "/admin/products",
        component: { template: "<div/>" },
        meta: { requiresAuth: true },
      },
    ],
  });

  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      authStore.redirectPath = to.fullPath;
      return { path: "/login" };
    }
    if (to.meta.requiresGuest && authStore.isLoggedIn) {
      return { path: "/admin/products" };
    }
  });

  return router;
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.clearAllMocks();
});

describe("Navigation Guard — 未登入", () => {
  it("未登入存取 /admin/products 時導向 /login", async () => {
    const authStore = useAuthStore();
    const router = buildRouter(authStore);
    await router.push("/admin/products");
    expect(router.currentRoute.value.path).toBe("/login");
  });

  it("未登入存取 /admin/products 時記錄 redirectPath", async () => {
    const authStore = useAuthStore();
    const router = buildRouter(authStore);
    await router.push("/admin/products");
    expect(authStore.redirectPath).toBe("/admin/products");
  });

  it("未登入存取公開路由 /products 時正常進入", async () => {
    const authStore = useAuthStore();
    const router = buildRouter(authStore);
    await router.push("/products");
    expect(router.currentRoute.value.path).toBe("/products");
  });
});

describe("Navigation Guard — 已登入", () => {
  it("已登入存取 /login 時自動重導至 /admin/products", async () => {
    localStorage.setItem("access_token", "valid-token");
    const authStore = useAuthStore();
    const router = buildRouter(authStore);
    await router.push("/login");
    expect(router.currentRoute.value.path).toBe("/admin/products");
  });

  it("已登入存取 /admin/products 時正常進入", async () => {
    localStorage.setItem("access_token", "valid-token");
    const authStore = useAuthStore();
    const router = buildRouter(authStore);
    await router.push("/admin/products");
    expect(router.currentRoute.value.path).toBe("/admin/products");
  });
});

describe("Router 路由設定", () => {
  it("應包含 /login 路由且帶有 requiresGuest meta", async () => {
    const { routes } = await import("../router/index.js");
    const loginRoute = routes.find((r) => r.path === "/login");
    expect(loginRoute).toBeDefined();
    expect(loginRoute.meta?.requiresGuest).toBe(true);
  });
});
