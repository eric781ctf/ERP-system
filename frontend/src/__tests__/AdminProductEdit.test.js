/**
 * Task 11.1 / 11.2 / 11.3 — AdminProductEditView 測試
 * 後台產品新增/編輯：雙語 tab、composition 驗證、規格欄位、tag 管理、updated_at
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import zhTW from "../locales/zh-TW/product.json";
import en from "../locales/en/product.json";

// Mutable route mock (changed per-test)
const mockRoute = { params: {} };
const mockRouter = { push: vi.fn() };

vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => mockRoute),
  useRouter: vi.fn(() => mockRouter),
}));

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

vi.mock("../api/tags.js", () => ({
  fetchTags: vi.fn().mockResolvedValue({ data: ["素色", "平紋"] }),
}));

import * as productsApi from "../api/products.js";
import * as tagsApi from "../api/tags.js";
import AdminProductEditView from "../views/admin/AdminProductEditView.vue";

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

const mockProduct = {
  id: 1,
  name_zh: "素色布",
  name_en: "Plain Fabric",
  description_zh: "細緻平紋",
  description_en: "Fine plain weave",
  composition: "100% Polyester",
  yarn_count: "150D",
  density: "200x100",
  weight_gsm: 120,
  width: '60"',
  weave_structure: "平紋",
  is_published: false,
  updated_at: "2026-03-22T14:30:00Z",
  cover_image_url: null,
  tags: ["素色"],
};

// ── Task 11.1 — 基本表單 ─────────────────────────────────────────────────────

describe("AdminProductEditView — Task 11.1 基本表單", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.params = {};
    mockRouter.push.mockReset();
    productsApi.fetchProduct.mockResolvedValue({ data: mockProduct });
    tagsApi.fetchTags.mockResolvedValue({ data: ["素色", "平紋"] });
  });

  it("新增模式：composition 欄位初始為空", async () => {
    mockRoute.params = {};
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.find('input[name="composition"]').element.value).toBe("");
  });

  it("編輯模式：呼叫 fetchProduct(id) 並填入 composition", async () => {
    mockRoute.params = { id: "1" };
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(productsApi.fetchProduct).toHaveBeenCalledWith("1");
    expect(wrapper.find('input[name="composition"]').element.value).toBe(
      "100% Polyester"
    );
  });

  it("繁體中文 tab（預設）顯示 name_zh 欄位，不顯示 name_en", async () => {
    mockRoute.params = {};
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.find('input[name="name_zh"]').exists()).toBe(true);
    expect(wrapper.find('input[name="name_en"]').exists()).toBe(false);
  });

  it("切換至 English tab 顯示 name_en 欄位，不顯示 name_zh", async () => {
    mockRoute.params = {};
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    await wrapper.find(".tab-en").trigger("click");
    expect(wrapper.find('input[name="name_en"]').exists()).toBe(true);
    expect(wrapper.find('input[name="name_zh"]').exists()).toBe(false);
  });

  it("composition 為空時阻止送出並顯示錯誤", async () => {
    mockRoute.params = {};
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    await wrapper.find("form").trigger("submit");
    expect(productsApi.createProduct).not.toHaveBeenCalled();
    expect(wrapper.find(".composition-error").exists()).toBe(true);
  });

  it("新增模式：composition 有值時呼叫 createProduct 並導向列表頁", async () => {
    mockRoute.params = {};
    productsApi.createProduct.mockResolvedValue({ data: { id: 99, name_zh: "新布" } });
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    await wrapper.find('input[name="composition"]').setValue("Cotton");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(productsApi.createProduct).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/admin/products");
  });

  it("編輯模式：送出時呼叫 updateProduct", async () => {
    mockRoute.params = { id: "1" };
    productsApi.updateProduct.mockResolvedValue({
      data: { ...mockProduct, updated_at: "2026-03-22T15:00:00Z" },
    });
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(productsApi.updateProduct).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ composition: "100% Polyester" })
    );
  });
});

// ── Task 11.2 — 規格欄位與 Tag 管理 ─────────────────────────────────────────

describe("AdminProductEditView — Task 11.2 規格欄位與 Tag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.params = {};
    tagsApi.fetchTags.mockResolvedValue({ data: ["素色", "平紋"] });
    productsApi.fetchProduct.mockResolvedValue({ data: mockProduct });
  });

  it("顯示選填規格欄位", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.find('input[name="yarn_count"]').exists()).toBe(true);
    expect(wrapper.find('input[name="density"]').exists()).toBe(true);
    expect(wrapper.find('input[name="weight_gsm"]').exists()).toBe(true);
    expect(wrapper.find('input[name="width"]').exists()).toBe(true);
    expect(wrapper.find('input[name="weave_structure"]').exists()).toBe(true);
  });

  it("顯示現有 tag 選項供選擇", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    const tagOptions = wrapper.findAll(".tag-option");
    expect(tagOptions.length).toBe(2);
    expect(tagOptions.some((t) => t.text().includes("素色"))).toBe(true);
    expect(tagOptions.some((t) => t.text().includes("平紋"))).toBe(true);
  });

  it("點擊現有 tag 選項將其加入已選 tag", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    // Click 平紋 (index 1)
    await wrapper.findAll(".tag-option")[1].trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      wrapper.findAll(".selected-tag").some((t) => t.text().includes("平紋"))
    ).toBe(true);
  });

  it("在 tag 輸入框輸入新名稱後按 Enter 加入 tag（統一 lowercase）", async () => {
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    const input = wrapper.find('input[name="tag_input"]');
    await input.setValue("NewTag");
    await input.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();
    expect(
      wrapper.findAll(".selected-tag").some((t) => t.text().includes("newtag"))
    ).toBe(true);
  });

  it("點擊已選 tag 的移除鈕將其移除", async () => {
    mockRoute.params = { id: "1" };
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    // mockProduct has tags: ['素色'] → 1 selected tag
    expect(wrapper.findAll(".selected-tag").length).toBe(1);
    await wrapper.find(".remove-tag-btn").trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".selected-tag").length).toBe(0);
  });
});

// ── Task 11.3 — 最後更新時間 ──────────────────────────────────────────────────

describe("AdminProductEditView — Task 11.3 最後更新時間", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.fetchProduct.mockResolvedValue({ data: mockProduct });
    tagsApi.fetchTags.mockResolvedValue({ data: [] });
  });

  it("新增模式不顯示 updated_at", async () => {
    mockRoute.params = {};
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.find(".updated-at").exists()).toBe(false);
  });

  it("編輯模式顯示 updated_at 格式 YYYY-MM-DD HH:mm", async () => {
    mockRoute.params = { id: "1" };
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.find(".updated-at").exists()).toBe(true);
    expect(wrapper.find(".updated-at").text()).toContain("2026-03-22 14:30");
  });

  it("儲存成功後 updated_at 更新為新時間", async () => {
    mockRoute.params = { id: "1" };
    productsApi.updateProduct.mockResolvedValue({
      data: { ...mockProduct, updated_at: "2026-03-22T15:00:00Z" },
    });
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();
    expect(wrapper.find(".updated-at").text()).toContain("2026-03-22 14:30");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.find(".updated-at").text()).toContain("2026-03-22 15:00");
  });
});
