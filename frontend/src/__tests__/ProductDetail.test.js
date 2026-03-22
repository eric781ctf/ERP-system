/**
 * Task 9.1 / 9.2 — ProductDetailView & ProductImageCarousel 測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
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
vi.mock("../api/tags.js", () => ({
  fetchTags: vi.fn().mockResolvedValue({ data: [] }),
}));

function makePlugins(locale = "zh-TW") {
  const pinia = createPinia();
  setActivePinia(pinia);
  const i18n = createI18n({
    legacy: false, locale, fallbackLocale: "zh-TW",
    messages: { "zh-TW": zhTW, en },
  });
  return [pinia, i18n];
}

const FULL_PRODUCT = {
  id: 1,
  name_zh: "素色平紋布",
  name_en: "Plain Weave Solid",
  description_zh: "高品質平紋布",
  description_en: "High quality plain weave",
  composition: "100% Polyester",
  yarn_count: "75D",
  density: "128×68",
  weight_gsm: 180,
  width: "58\"",
  weave_structure: "平紋",
  tags: ["素色", "平紋"],
  images: [
    { id: 1, url: "https://cdn.example.com/img0.jpg", sort_order: 0 },
    { id: 2, url: "https://cdn.example.com/img1.jpg", sort_order: 1 },
  ],
};

// ── Task 9.2 ProductImageCarousel ─────────────────────────────────────────────

import ProductImageCarousel from "../components/ProductImageCarousel.vue";

describe("ProductImageCarousel", () => {
  it("shows single image without carousel controls", () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductImageCarousel, {
      props: { images: [{ id: 1, url: "https://cdn.example.com/img.jpg", sort_order: 0 }] },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.find("img").exists()).toBe(true);
    expect(wrapper.find(".carousel-controls").exists()).toBe(false);
  });

  it("shows carousel controls for multiple images", () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductImageCarousel, {
      props: { images: FULL_PRODUCT.images },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.find(".carousel-controls").exists()).toBe(true);
  });

  it("shows placeholder when images array is empty", () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductImageCarousel, {
      props: { images: [] },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".carousel-placeholder").exists()).toBe(true);
  });

  it("displays first image (sort_order=0) initially", () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductImageCarousel, {
      props: { images: FULL_PRODUCT.images },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.find("img").attributes("src")).toBe("https://cdn.example.com/img0.jpg");
  });

  it("navigates to next image on next button click", async () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductImageCarousel, {
      props: { images: FULL_PRODUCT.images },
      global: { plugins: [pinia, i18n] },
    });
    await wrapper.find(".carousel-next").trigger("click");
    expect(wrapper.find("img").attributes("src")).toBe("https://cdn.example.com/img1.jpg");
  });

  it("navigates back on prev button click", async () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductImageCarousel, {
      props: { images: FULL_PRODUCT.images },
      global: { plugins: [pinia, i18n] },
    });
    await wrapper.find(".carousel-next").trigger("click");
    await wrapper.find(".carousel-prev").trigger("click");
    expect(wrapper.find("img").attributes("src")).toBe("https://cdn.example.com/img0.jpg");
  });
});

// ── Task 9.1 ProductDetailView ────────────────────────────────────────────────

import ProductDetailView from "../views/public/ProductDetailView.vue";
import { useProductsStore } from "../stores/products.js";

describe("ProductDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders zh-TW name and description by default", async () => {
    const [pinia, i18n] = makePlugins("zh-TW");
    const store = useProductsStore();
    store.currentProduct = FULL_PRODUCT;

    const wrapper = mount(ProductDetailView, {
      global: {
        plugins: [pinia, i18n],
        stubs: { RouterLink: true, ProductImageCarousel: true },
      },
    });
    expect(wrapper.text()).toContain("素色平紋布");
    expect(wrapper.text()).toContain("高品質平紋布");
  });

  it("renders en name and description when locale is en", async () => {
    const [pinia, i18n] = makePlugins("en");
    const store = useProductsStore();
    store.currentProduct = FULL_PRODUCT;

    const wrapper = mount(ProductDetailView, {
      global: {
        plugins: [pinia, i18n],
        stubs: { RouterLink: true, ProductImageCarousel: true },
      },
    });
    expect(wrapper.text()).toContain("Plain Weave Solid");
    expect(wrapper.text()).toContain("High quality plain weave");
  });

  it("falls back to zh when en content is empty", async () => {
    const [pinia, i18n] = makePlugins("en");
    const store = useProductsStore();
    store.currentProduct = { ...FULL_PRODUCT, name_en: "", description_en: "" };

    const wrapper = mount(ProductDetailView, {
      global: {
        plugins: [pinia, i18n],
        stubs: { RouterLink: true, ProductImageCarousel: true },
      },
    });
    expect(wrapper.text()).toContain("素色平紋布");
  });

  it("shows available spec fields and hides null ones", async () => {
    const [pinia, i18n] = makePlugins("zh-TW");
    const store = useProductsStore();
    store.currentProduct = { ...FULL_PRODUCT, yarn_count: null, density: null };

    const wrapper = mount(ProductDetailView, {
      global: {
        plugins: [pinia, i18n],
        stubs: { RouterLink: true, ProductImageCarousel: true },
      },
    });
    expect(wrapper.text()).toContain("100% Polyester");
    expect(wrapper.text()).not.toContain("75D");
  });

  it("shows product tags", async () => {
    const [pinia, i18n] = makePlugins();
    const store = useProductsStore();
    store.currentProduct = FULL_PRODUCT;

    const wrapper = mount(ProductDetailView, {
      global: {
        plugins: [pinia, i18n],
        stubs: { RouterLink: true, ProductImageCarousel: true },
      },
    });
    expect(wrapper.text()).toContain("素色");
    expect(wrapper.text()).toContain("平紋");
  });
});
