/**
 * Task 7.2 — LoginView 元件測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { createI18n } from "vue-i18n";
import LoginView from "../views/auth/LoginView.vue";
import { useAuthStore } from "../stores/auth.js";

vi.mock("../api/auth.js", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
}));

import * as authApi from "../api/auth.js";

function createWrapper(options = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/login", component: LoginView },
      { path: "/admin/products", component: { template: "<div>admin</div>" } },
    ],
  });

  const i18n = createI18n({
    legacy: false,
    locale: "zh-TW",
    messages: {
      "zh-TW": {
        auth: {
          login: {
            title: "登入",
            username: "帳號",
            password: "密碼",
            submit: "登入",
            showPassword: "顯示密碼",
            hidePassword: "隱藏密碼",
            loading: "登入中...",
            error: {
              required: "此欄位為必填",
              invalid: "帳號或密碼錯誤",
              network: "網路連線錯誤，請稍後再試",
              unknown: "登入失敗，請稍後再試",
            },
          },
        },
      },
    },
  });

  return mount(LoginView, {
    global: {
      plugins: [pinia, router, i18n],
    },
    ...options,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("LoginView — 表單驗證", () => {
  it("空帳號送出時顯示必填錯誤，不呼叫 API", async () => {
    const wrapper = createWrapper();
    await wrapper.find("form").trigger("submit");

    expect(authApi.login).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("此欄位為必填");
  });

  it("空密碼送出時顯示必填錯誤，不呼叫 API", async () => {
    const wrapper = createWrapper();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("form").trigger("submit");

    expect(authApi.login).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("此欄位為必填");
  });
});

describe("LoginView — 眼睛圖示", () => {
  it("點擊眼睛圖示前密碼欄位 type 為 password", () => {
    const wrapper = createWrapper();
    expect(wrapper.find("#password").attributes("type")).toBe("password");
  });

  it("點擊眼睛圖示後密碼欄位 type 切換為 text", async () => {
    const wrapper = createWrapper();
    await wrapper.find(".toggle-password").trigger("click");
    expect(wrapper.find("#password").attributes("type")).toBe("text");
  });

  it("再次點擊眼睛圖示後密碼欄位恢復 password", async () => {
    const wrapper = createWrapper();
    await wrapper.find(".toggle-password").trigger("click");
    await wrapper.find(".toggle-password").trigger("click");
    expect(wrapper.find("#password").attributes("type")).toBe("password");
  });
});

describe("LoginView — 登入流程", () => {
  it("API 回傳 401 時顯示錯誤訊息，不導頁", async () => {
    authApi.login.mockRejectedValue({ response: { status: 401 } });

    const wrapper = createWrapper();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("#password").setValue("wrong");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("帳號或密碼錯誤");
  });

  it("網路錯誤時顯示網路錯誤訊息", async () => {
    authApi.login.mockRejectedValue(new Error("Network Error"));

    const wrapper = createWrapper();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("#password").setValue("pw");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("網路連線錯誤");
  });
});
