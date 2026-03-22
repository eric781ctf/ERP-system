/**
 * Task 10.1 / 10.2 / 10.3 — AdminProductListView 測試
 * 後台產品列表：顯示全部產品、發布切換、刪除確認
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import zhTW from "../locales/zh-TW/product.json";
import en from "../locales/en/product.json";

vi.mock("../api/products.js", () => ({
  fetchProducts: vi.fn().mockResolvedValue({ data: [] }),
  fetchProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  togglePublish: vi.fn(),
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  reorderImages: vi.fn(),
}));

import * as productsApi from "../api/products.js";
import AdminProductListView from "../views/admin/AdminProductListView.vue";

function makePlugins() {
  const pinia = createPinia();
  const i18n = createI18n({
    legacy: false,
    locale: "zh-TW",
    fallbackLocale: "zh-TW",
    messages: { "zh-TW": zhTW, en },
  });
  return [pinia, i18n];
}

const mockProducts = [
  {
    id: 1,
    name_zh: "素色布",
    name_en: "Plain Fabric",
    composition: "100% Polyester",
    is_published: true,
    updated_at: "2026-03-22T14:30:00Z",
    cover_image_url: null,
    tags: [],
  },
  {
    id: 2,
    name_zh: "格紋布",
    name_en: "Plaid Fabric",
    composition: "100% Cotton",
    is_published: false,
    updated_at: "2026-03-21T09:15:00Z",
    cover_image_url: null,
    tags: [],
  },
];

// ── Task 10.1 — 產品列表頁 ─────────────────────────────────────────────────────

describe("AdminProductListView — Task 10.1 產品列表", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.fetchProducts.mockResolvedValue({ data: mockProducts });
  });

  it("呼叫 fetchProducts 取得全部產品（不過濾）", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    mount(AdminProductListView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();
    expect(productsApi.fetchProducts).toHaveBeenCalledWith({});
  });

  it("顯示所有產品名稱（含未發布）", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("素色布");
    expect(wrapper.text()).toContain("格紋布");
  });

  it("已發布產品顯示發布狀態標籤", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    // 應該顯示「已發布」文字
    expect(wrapper.text()).toContain("已發布");
  });

  it("未發布產品顯示草稿狀態標籤", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("草稿");
  });

  it("顯示 updated_at 格式為 YYYY-MM-DD HH:mm", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    // ISO "2026-03-22T14:30:00Z" → "2026-03-22 14:30"
    expect(wrapper.text()).toContain("2026-03-22 14:30");
  });
});

// ── Task 10.2 — 發布狀態切換 ───────────────────────────────────────────────────

describe("AdminProductListView — Task 10.2 發布狀態切換", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.fetchProducts.mockResolvedValue({ data: mockProducts });
  });

  it("每個產品列顯示切換按鈕", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    const toggleBtns = wrapper.findAll(".toggle-publish-btn");
    expect(toggleBtns.length).toBe(2);
  });

  it("已發布產品的切換按鈕顯示「取消發布」", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    const toggleBtns = wrapper.findAll(".toggle-publish-btn");
    expect(toggleBtns[0].text()).toBe("取消發布");
  });

  it("未發布產品的切換按鈕顯示「發布」", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    const toggleBtns = wrapper.findAll(".toggle-publish-btn");
    expect(toggleBtns[1].text()).toBe("發布");
  });

  it("點擊切換按鈕呼叫 store.togglePublish 並傳入反向值", async () => {
    productsApi.togglePublish.mockResolvedValue({
      data: { is_published: false },
    });
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    const toggleBtns = wrapper.findAll(".toggle-publish-btn");
    // 第一個產品 is_published=true → 切換為 false
    await toggleBtns[0].trigger("click");
    expect(productsApi.togglePublish).toHaveBeenCalledWith(1, false);
  });

  it("API 切換失敗後顯示錯誤訊息", async () => {
    productsApi.togglePublish.mockRejectedValue(new Error("切換失敗"));
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    const toggleBtns = wrapper.findAll(".toggle-publish-btn");
    await toggleBtns[0].trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("切換失敗");
  });
});

// ── Task 10.3 — 產品刪除 ──────────────────────────────────────────────────────

describe("AdminProductListView — Task 10.3 產品刪除", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.fetchProducts.mockResolvedValue({ data: mockProducts });
  });

  it("每個產品列顯示刪除按鈕", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    const deleteBtns = wrapper.findAll(".delete-btn");
    expect(deleteBtns.length).toBe(2);
  });

  it("點擊刪除按鈕顯示確認對話框", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    expect(wrapper.find(".confirm-dialog").exists()).toBe(false);
    await wrapper.findAll(".delete-btn")[0].trigger("click");
    expect(wrapper.find(".confirm-dialog").exists()).toBe(true);
    expect(wrapper.text()).toContain("確定要刪除這個產品嗎？");
  });

  it("點擊取消關閉確認對話框且不呼叫 API", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    await wrapper.findAll(".delete-btn")[0].trigger("click");
    expect(wrapper.find(".confirm-dialog").exists()).toBe(true);

    await wrapper.find(".cancel-delete-btn").trigger("click");
    expect(wrapper.find(".confirm-dialog").exists()).toBe(false);
    expect(productsApi.deleteProduct).not.toHaveBeenCalled();
  });

  it("確認刪除後呼叫 deleteProduct 並從列表移除", async () => {
    productsApi.deleteProduct.mockResolvedValue({ success: true });
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    await wrapper.findAll(".delete-btn")[0].trigger("click");
    await wrapper.find(".confirm-delete-btn").trigger("click");
    await flushPromises();

    expect(productsApi.deleteProduct).toHaveBeenCalledWith(1);
    // 對話框應關閉
    expect(wrapper.find(".confirm-dialog").exists()).toBe(false);
    // 列表中不再顯示已刪除的產品
    expect(wrapper.text()).not.toContain("素色布");
  });

  it("刪除 API 失敗時顯示錯誤訊息", async () => {
    productsApi.deleteProduct.mockRejectedValue(new Error("刪除失敗"));
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductListView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    await wrapper.findAll(".delete-btn")[0].trigger("click");
    await wrapper.find(".confirm-delete-btn").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("刪除失敗");
    // 對話框仍在（以便重試或取消）
    expect(wrapper.find(".confirm-dialog").exists()).toBe(true);
  });
});
