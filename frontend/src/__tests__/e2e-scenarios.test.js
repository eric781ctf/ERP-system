/**
 * Task 13.3 — 前端 E2E 情境測試（Vitest component integration）
 *
 * 覆蓋 spec requirements:
 *   1.1 / 1.3 — 訪客型錄：顯示已發布產品、語言切換、fallback
 *   3.2 / 3.3 — 語言切換後名稱即時更新、en 為空 fallback 顯示中文
 *   4.5       — 後台新增：composition 空 → 表單錯誤阻止送出
 *   6.6       — 圖片上傳：非 JPG/PNG → 前端阻擋
 *   8.4 / 8.5 — Tag 篩選：勾選後只顯示含 tag 產品；取消後恢復全部
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import zhTW from "../locales/zh-TW/product.json";
import en from "../locales/en/product.json";

// ── Mocks ─────────────────────────────────────────────────────────────────────

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
  fetchTags: vi.fn().mockResolvedValue({ data: [] }),
}));
vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({ params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import * as productsApi from "../api/products.js";
import * as tagsApi from "../api/tags.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const publishedProducts = [
  {
    id: 1,
    name_zh: "素色平紋布",
    name_en: "Plain Weave Solid",
    composition: "100% Polyester",
    is_published: true,
    updated_at: "2026-03-22T10:00:00Z",
    cover_image_url: null,
    tags: ["素色"],
  },
  {
    id: 2,
    name_zh: "格紋斜紋布",
    name_en: "",
    composition: "100% Cotton",
    is_published: true,
    updated_at: "2026-03-21T09:00:00Z",
    cover_image_url: null,
    tags: ["格紋"],
  },
];

function makePlugins(locale = "zh-TW") {
  const pinia = createPinia();
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: "zh-TW",
    messages: { "zh-TW": zhTW, en },
  });
  return [pinia, i18n];
}

// ── Scenario 1: 訪客瀏覽型錄顯示已發布產品 (Req 1.1) ──────────────────────────

describe("E2E Scenario 1 — 訪客型錄瀏覽（Req 1.1）", () => {
  beforeEach(() => vi.clearAllMocks());

  it("型錄頁顯示所有已發布產品名稱", async () => {
    productsApi.fetchProducts.mockResolvedValue({ data: publishedProducts });
    tagsApi.fetchTags.mockResolvedValue({ data: [] });

    const { default: ProductCatalogView } = await import(
      "../views/public/ProductCatalogView.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ProductCatalogView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("素色平紋布");
    expect(wrapper.text()).toContain("格紋斜紋布");
  });

  it("型錄頁不顯示購物車或結帳相關內容（Req 1.4）", async () => {
    productsApi.fetchProducts.mockResolvedValue({ data: publishedProducts });
    tagsApi.fetchTags.mockResolvedValue({ data: [] });

    const { default: ProductCatalogView } = await import(
      "../views/public/ProductCatalogView.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ProductCatalogView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toMatch(/購物車|加入購物車|結帳|checkout/i);
  });
});

// ── Scenario 2: 語言切換後產品名稱即時更新 (Req 3.2 / 3.3) ────────────────────

describe("E2E Scenario 2 — 語言切換（Req 3.2 / 3.3）", () => {
  beforeEach(() => vi.clearAllMocks());

  it("切換至英文後顯示 name_en（Req 3.2）", async () => {
    const { default: ProductCard } = await import(
      "../components/ProductCard.vue"
    );
    const [pinia, i18n] = makePlugins("zh-TW");
    setActivePinia(pinia);

    const wrapper = mount(ProductCard, {
      props: { product: publishedProducts[0] },
      global: { plugins: [pinia, i18n] },
    });

    expect(wrapper.text()).toContain("素色平紋布");
    i18n.global.locale.value = "en";
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Plain Weave Solid");
    expect(wrapper.text()).not.toContain("素色平紋布");
  });

  it("name_en 為空時 fallback 顯示 name_zh（Req 3.3）", async () => {
    const { default: ProductCard } = await import(
      "../components/ProductCard.vue"
    );
    const [pinia, i18n] = makePlugins("en");
    setActivePinia(pinia);

    // Product 2 has name_en: "" → should fallback to name_zh
    const wrapper = mount(ProductCard, {
      props: { product: publishedProducts[1] },
      global: { plugins: [pinia, i18n] },
    });

    expect(wrapper.text()).toContain("格紋斜紋布");
    expect(wrapper.text()).not.toContain('""');
  });
});

// ── Scenario 3: Tag 篩選 (Req 8.4 / 8.5) ─────────────────────────────────────

describe("E2E Scenario 3 — Tag 篩選（Req 8.4 / 8.5）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tagsApi.fetchTags.mockResolvedValue({ data: ["素色", "格紋"] });
  });

  it("勾選 tag 後只顯示含該 tag 的產品（Req 8.4）", async () => {
    // Initial: all products
    productsApi.fetchProducts.mockResolvedValue({ data: publishedProducts });

    const { default: ProductCatalogView } = await import(
      "../views/public/ProductCatalogView.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ProductCatalogView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    // After selecting 素色 tag, only product 1 returned
    productsApi.fetchProducts.mockResolvedValue({ data: [publishedProducts[0]] });

    const { useTagsStore } = await import("../stores/tags.js");
    const tagsStore = useTagsStore();
    tagsStore.selectTag("素色");
    await flushPromises();

    expect(productsApi.fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ["素色"] })
    );
  });

  it("取消所有 tag 後恢復全部產品（Req 8.5）", async () => {
    productsApi.fetchProducts.mockResolvedValue({ data: publishedProducts });

    const { default: ProductCatalogView } = await import(
      "../views/public/ProductCatalogView.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    mount(ProductCatalogView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    const { useTagsStore } = await import("../stores/tags.js");
    const tagsStore = useTagsStore();

    // Select then deselect
    tagsStore.selectTag("素色");
    await flushPromises();
    tagsStore.deselectTag("素色");
    await flushPromises();

    // Last call should have empty tags
    const calls = productsApi.fetchProducts.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall.tags).toEqual([]);
  });
});

// ── Scenario 4: 後台新增產品不填成份 → 表單錯誤（Req 4.5） ──────────────────

describe("E2E Scenario 4 — 後台新增：composition 空 → 表單錯誤（Req 4.5）", () => {
  beforeEach(() => vi.clearAllMocks());

  it("composition 空白時送出表單顯示欄位錯誤並不呼叫 API", async () => {
    tagsApi.fetchTags.mockResolvedValue({ data: [] });

    const { default: AdminProductEditView } = await import(
      "../views/admin/AdminProductEditView.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(AdminProductEditView, {
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    // Submit without filling composition
    await wrapper.find("form").trigger("submit");

    expect(productsApi.createProduct).not.toHaveBeenCalled();
    expect(wrapper.find(".composition-error").exists()).toBe(true);
  });
});

// ── Scenario 5: 圖片上傳非 JPG/PNG → 前端阻擋（Req 6.6） ────────────────────

describe("E2E Scenario 5 — 圖片上傳格式驗證（Req 6.6）", () => {
  beforeEach(() => vi.clearAllMocks());

  it("上傳 WebP 圖片時前端阻擋且顯示格式錯誤（不呼叫 API）", async () => {
    const { default: AdminImageUpload } = await import(
      "../components/AdminImageUpload.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    const { useProductsStore } = await import("../stores/products.js");
    const store = useProductsStore();
    store.currentProduct = { id: 1, images: [] };

    const wrapper = mount(AdminImageUpload, {
      props: { productId: 1 },
      global: { plugins: [pinia, i18n] },
    });

    const file = new File([new Uint8Array(100)], "photo.webp", {
      type: "image/webp",
    });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", {
      value: [file],
      configurable: true,
    });
    await input.trigger("change");
    await flushPromises();

    expect(productsApi.uploadImage).not.toHaveBeenCalled();
    expect(wrapper.find(".upload-error").exists()).toBe(true);
    expect(wrapper.find(".upload-error").text()).toContain("JPG");
  });

  it("上傳 PNG 圖片時通過前端驗證並呼叫 API（Req 6.6 正向）", async () => {
    productsApi.uploadImage.mockResolvedValue({
      data: { id: 5, url: "https://cdn/x.png", sort_order: 0 },
    });
    productsApi.fetchProduct.mockResolvedValue({
      data: { id: 1, images: [] },
    });

    const { default: AdminImageUpload } = await import(
      "../components/AdminImageUpload.vue"
    );
    const [pinia, i18n] = makePlugins();
    setActivePinia(pinia);

    const { useProductsStore } = await import("../stores/products.js");
    const store = useProductsStore();
    store.currentProduct = { id: 1, images: [] };

    const wrapper = mount(AdminImageUpload, {
      props: { productId: 1 },
      global: { plugins: [pinia, i18n] },
    });

    const file = new File([new Uint8Array(100)], "photo.png", {
      type: "image/png",
    });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", {
      value: [file],
      configurable: true,
    });
    await input.trigger("change");
    await flushPromises();

    expect(productsApi.uploadImage).toHaveBeenCalledWith(1, expect.any(FormData));
    expect(wrapper.find(".upload-error").exists()).toBe(false);
  });
});
