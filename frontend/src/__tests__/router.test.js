/**
 * Task 1.2 — Vue Router 設定測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import { routes } from "../router/index.js";

describe("Vue Router 路由設定", () => {
  let router;

  beforeEach(() => {
    router = createRouter({ history: createMemoryHistory(), routes });
  });

  it("應包含公開型錄首頁路由 /", () => {
    const route = routes.find((r) => r.path === "/");
    expect(route).toBeDefined();
  });

  it("應包含產品型錄路由 /products", () => {
    const route = routes.find((r) => r.path === "/products");
    expect(route).toBeDefined();
  });

  it("應包含產品詳細頁路由 /products/:id", () => {
    const route = routes.find((r) => r.path === "/products/:id");
    expect(route).toBeDefined();
  });

  it("應包含管理路由前綴 /admin", () => {
    const adminRoute = routes.find(
      (r) => r.path === "/admin" || r.path.startsWith("/admin")
    );
    expect(adminRoute).toBeDefined();
  });

  it("管理路由應附有 requiresAuth meta 標記", () => {
    const adminRoute = routes.find(
      (r) => r.path === "/admin" || r.path.startsWith("/admin")
    );
    const checkMeta = (r) => {
      if (r.meta?.requiresAuth) return true;
      if (r.children) return r.children.some(checkMeta);
      return false;
    };
    expect(checkMeta(adminRoute)).toBe(true);
  });
});
