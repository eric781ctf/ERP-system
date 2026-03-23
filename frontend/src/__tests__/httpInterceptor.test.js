/**
 * Task 7.4 — axios response interceptor 測試
 *
 * 測試策略：
 *   用 vi.hoisted() 在 mock 工廠執行前宣告共用變數，
 *   捕捉 http.js 在初始化時向 interceptors.response.use() 傳入的 errorFn，
 *   再直接呼叫它進行 white-box 測試。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// ── Hoist shared mocks so they're available inside vi.mock factory ─────────────
const mocks = vi.hoisted(() => {
  let _errorInterceptor = null;
  const retryMock = vi.fn();   // 代替 http(originalRequest) 的重試呼叫
  const axiosPostMock = vi.fn(); // 代替 axios.post 的 refresh 呼叫

  return {
    retryMock,
    axiosPostMock,
    setErrorInterceptor: (fn) => { _errorInterceptor = fn; },
    getErrorInterceptor: () => _errorInterceptor,
  };
});

// ── Mock axios：捕捉 interceptors ──────────────────────────────────────────────
vi.mock("axios", () => {
  // 這個 function 同時作為 axios instance（可呼叫）以及持有 interceptors
  const httpInstance = Object.assign(mocks.retryMock, {
    interceptors: {
      request: { use: vi.fn() },
      response: {
        use: vi.fn((_ok, errorFn) => {
          mocks.setErrorInterceptor(errorFn);
        }),
      },
    },
    defaults: { headers: { common: {} } },
  });

  return {
    default: {
      create: vi.fn(() => httpInstance),
      post: mocks.axiosPostMock,
    },
  };
});

// ── Mock auth store ────────────────────────────────────────────────────────────
const mockLogout = vi.fn();
vi.mock("../stores/auth.js", () => ({
  useAuthStore: vi.fn(() => ({
    accessToken: "",
    logout: mockLogout,
  })),
}));

// Import http to trigger interceptor registration
import http from "../api/http.js"; // noqa

// ── Helpers ───────────────────────────────────────────────────────────────────
function make401Error(url = "/api/v1/products") {
  return {
    response: { status: 401 },
    config: { url, headers: {}, _retry: false },
  };
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.clearAllMocks();
  // 重設 errorInterceptor 後，interceptors.response.use 已被 clear，
  // 但 http.js 只在 module load 時呼叫一次，所以 getErrorInterceptor() 仍有效。
});

afterEach(() => {
  localStorage.clear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("http interceptor — 401 → refresh 成功 → 重試原始請求", () => {
  it("呼叫 axios.post /auth/refresh 並以新 token 重試原始請求", async () => {
    localStorage.setItem("refresh_token", "old-refresh");

    mocks.axiosPostMock.mockResolvedValueOnce({
      data: { data: { access_token: "new-access-token" } },
    });
    mocks.retryMock.mockResolvedValueOnce({ data: { success: true } });

    const error = make401Error();
    const errorInterceptor = mocks.getErrorInterceptor();
    await errorInterceptor(error);

    expect(mocks.axiosPostMock).toHaveBeenCalledWith(
      "/api/v1/auth/refresh",
      {},
      expect.objectContaining({
        headers: { Authorization: "Bearer old-refresh" },
      })
    );
    expect(mocks.retryMock).toHaveBeenCalled();
  });

  it("refresh 成功後將新 access_token 存入 localStorage", async () => {
    localStorage.setItem("refresh_token", "my-refresh");

    mocks.axiosPostMock.mockResolvedValueOnce({
      data: { data: { access_token: "fresh-token" } },
    });
    mocks.retryMock.mockResolvedValueOnce({});

    const errorInterceptor = mocks.getErrorInterceptor();
    await errorInterceptor(make401Error());

    expect(localStorage.getItem("access_token")).toBe("fresh-token");
  });
});

describe("http interceptor — refresh 失敗 → 呼叫 logout", () => {
  it("refresh API 失敗時呼叫 useAuthStore().logout()", async () => {
    localStorage.setItem("refresh_token", "expired-refresh");

    mocks.axiosPostMock.mockRejectedValueOnce(new Error("refresh failed"));

    const errorInterceptor = mocks.getErrorInterceptor();
    await errorInterceptor(make401Error()).catch(() => {});

    expect(mockLogout).toHaveBeenCalled();
  });

  it("refresh 失敗時仍然 reject 原始 error", async () => {
    mocks.axiosPostMock.mockRejectedValueOnce(new Error("network error"));

    const errorInterceptor = mocks.getErrorInterceptor();
    await expect(errorInterceptor(make401Error())).rejects.toThrow();
  });
});

describe("http interceptor — /auth/login 的 401 不觸發 refresh", () => {
  it("login 端點 401 直接 reject，不呼叫 refresh", async () => {
    const loginError = make401Error("/api/v1/auth/login");

    const errorInterceptor = mocks.getErrorInterceptor();
    await errorInterceptor(loginError).catch(() => {});

    expect(mocks.axiosPostMock).not.toHaveBeenCalled();
  });

  it("refresh 端點 401 直接 reject，不呼叫 refresh（防無限循環）", async () => {
    const refreshError = make401Error("/api/v1/auth/refresh");

    const errorInterceptor = mocks.getErrorInterceptor();
    await errorInterceptor(refreshError).catch(() => {});

    expect(mocks.axiosPostMock).not.toHaveBeenCalled();
  });
});

describe("http interceptor — 非 401 error 不處理", () => {
  it("500 error 直接 reject，不觸發 refresh", async () => {
    const serverError = {
      response: { status: 500 },
      config: { url: "/api/v1/products", headers: {} },
    };

    const errorInterceptor = mocks.getErrorInterceptor();
    await errorInterceptor(serverError).catch(() => {});

    expect(mocks.axiosPostMock).not.toHaveBeenCalled();
  });
});
