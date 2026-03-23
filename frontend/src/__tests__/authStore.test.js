/**
 * Task 7.1 — useAuthStore 單元測試
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../stores/auth.js";

vi.mock("../api/auth.js", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
}));

import * as authApi from "../api/auth.js";

// Mock window.location.replace
const mockReplace = vi.fn();
Object.defineProperty(window, "location", {
  value: { replace: mockReplace },
  writable: true,
});

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe("useAuthStore — 初始狀態", () => {
  it("無 localStorage token 時 isLoggedIn 為 false", () => {
    const store = useAuthStore();
    expect(store.isLoggedIn).toBe(false);
    expect(store.accessToken).toBe("");
  });

  it("localStorage 有 token 時 isLoggedIn 為 true", () => {
    localStorage.setItem("access_token", "existing-token");
    const store = useAuthStore();
    expect(store.isLoggedIn).toBe(true);
    expect(store.accessToken).toBe("existing-token");
  });
});

describe("useAuthStore — login()", () => {
  it("成功時將 token 存入 localStorage 並更新 state", async () => {
    authApi.login.mockResolvedValue({
      data: { access_token: "acc-123", refresh_token: "ref-456" },
    });
    authApi.me.mockResolvedValue({
      data: { username: "admin", is_active: true },
    });

    const store = useAuthStore();
    await store.login("admin", "password");

    expect(localStorage.getItem("access_token")).toBe("acc-123");
    expect(localStorage.getItem("refresh_token")).toBe("ref-456");
    expect(store.accessToken).toBe("acc-123");
    expect(store.refreshToken).toBe("ref-456");
    expect(store.isLoggedIn).toBe(true);
  });

  it("成功後呼叫 fetchMe 更新 username 與 isActive", async () => {
    authApi.login.mockResolvedValue({
      data: { access_token: "acc", refresh_token: "ref" },
    });
    authApi.me.mockResolvedValue({
      data: { username: "staff", is_active: true },
    });

    const store = useAuthStore();
    await store.login("staff", "pw");

    expect(store.username).toBe("staff");
    expect(store.isActive).toBe(true);
  });

  it("login API 失敗時拋出錯誤，不寫入 token", async () => {
    authApi.login.mockRejectedValue({ response: { status: 401 } });

    const store = useAuthStore();
    await expect(store.login("admin", "wrong")).rejects.toBeDefined();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(store.isLoggedIn).toBe(false);
  });
});

describe("useAuthStore — logout()", () => {
  it("成功時清除 localStorage 並導向 /login", async () => {
    localStorage.setItem("access_token", "acc");
    localStorage.setItem("refresh_token", "ref");
    authApi.logout.mockResolvedValue({});

    const store = useAuthStore();
    store.accessToken = "acc";
    store.refreshToken = "ref";

    await store.logout();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(store.accessToken).toBe("");
    expect(store.isLoggedIn).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("API 失敗時仍清除 localStorage token", async () => {
    localStorage.setItem("access_token", "acc");
    localStorage.setItem("refresh_token", "ref");
    authApi.logout.mockRejectedValue(new Error("network"));

    const store = useAuthStore();
    store.accessToken = "acc";

    await store.logout();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(store.isLoggedIn).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});
