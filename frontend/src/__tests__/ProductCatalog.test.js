/**
 * Task 8.1 / 8.2 / 8.3 — 產品型錄頁、ProductCard、TagFilter、語言切換聯動測試
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

import * as productsApi from "../api/products.js";
import * as tagsApi from "../api/tags.js";

function makePlugins(locale = "zh-TW") {
  return [
    createPinia(),
    createI18n({ legacy: false, locale, fallbackLocale: "zh-TW",
      messages: { "zh-TW": zhTW, en } }),
  ];
}

// ── Task 8.1 ProductCard ──────────────────────────────────────────────────────

import ProductCard from "../components/ProductCard.vue";

describe("ProductCard", () => {
  it("displays zh-TW name by default", () => {
    const [pinia, i18n] = makePlugins("zh-TW");
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1,
          name_zh: "素色布",
          name_en: "Plain Fabric",
          composition: "100% Polyester",
          cover_image_url: null,
          tags: ["素色"],
        },
      },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.text()).toContain("素色布");
    expect(wrapper.text()).not.toContain("購物車");
    expect(wrapper.text()).not.toContain("加入購物車");
  });

  it("displays en name when locale is en", () => {
    const [pinia, i18n] = makePlugins("en");
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1,
          name_zh: "素色布",
          name_en: "Plain Fabric",
          composition: "100% Polyester",
          cover_image_url: null,
          tags: [],
        },
      },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.text()).toContain("Plain Fabric");
  });

  it("falls back to zh name when en name is empty", () => {
    const [pinia, i18n] = makePlugins("en");
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1,
          name_zh: "素色布",
          name_en: "",
          composition: "100% Polyester",
          cover_image_url: null,
          tags: [],
        },
      },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.text()).toContain("素色布");
  });

  it("displays composition", () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductCard, {
      props: {
        product: { id: 1, name_zh: "布", name_en: null,
          composition: "Cotton", cover_image_url: null, tags: [] },
      },
      global: { plugins: [pinia, i18n] },
    });
    expect(wrapper.text()).toContain("Cotton");
  });

  it("shows cover image when available", () => {
    const [pinia, i18n] = makePlugins();
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1, name_zh: "布", name_en: null, composition: "Cotton",
          cover_image_url: "https://cdn.example.com/img.jpg", tags: [],
        },
      },
      global: { plugins: [pinia, i18n] },
    });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://cdn.example.com/img.jpg");
  });
});

// ── Task 8.2 TagFilter ────────────────────────────────────────────────────────

import TagFilter from "../components/TagFilter.vue";

describe("TagFilter", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    tagsApi.fetchTags.mockResolvedValue({ data: ["素色", "平紋"] });
    productsApi.fetchProducts.mockResolvedValue({ data: [] });
  });

  it("renders tag buttons from store", async () => {
    const [pinia, i18n] = makePlugins();
    const { useTagsStore } = await import("../stores/tags.js");
    setActivePinia(pinia);
    const tagsStore = useTagsStore();
    tagsStore.tags = ["素色", "平紋"];

    const wrapper = mount(TagFilter, { global: { plugins: [pinia, i18n] } });
    expect(wrapper.text()).toContain("素色");
    expect(wrapper.text()).toContain("平紋");
  });

  it("clicking a tag calls selectTag", async () => {
    const [pinia, i18n] = makePlugins();
    const { useTagsStore } = await import("../stores/tags.js");
    setActivePinia(pinia);
    const tagsStore = useTagsStore();
    tagsStore.tags = ["素色"];
    const spy = vi.spyOn(tagsStore, "selectTag");

    const wrapper = mount(TagFilter, { global: { plugins: [pinia, i18n] } });
    const btn = wrapper.findAll("button").find((b) => b.text() === "素色");
    await btn.trigger("click");
    expect(spy).toHaveBeenCalledWith("素色");
  });
});

// ── Task 8.3 語言切換後產品名稱更新 ──────────────────────────────────────────

describe("ProductCard — language switch reactivity", () => {
  it("updates displayed name when locale changes", async () => {
    const [pinia, i18n] = makePlugins("zh-TW");
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1, name_zh: "素色布", name_en: "Plain Fabric",
          composition: "Cotton", cover_image_url: null, tags: [],
        },
      },
      global: { plugins: [pinia, i18n] },
    });

    expect(wrapper.text()).toContain("素色布");
    i18n.global.locale.value = "en";
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Plain Fabric");
  });
});
