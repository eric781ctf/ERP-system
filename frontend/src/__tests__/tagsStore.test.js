/**
 * Task 6.2 — tagsStore 測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { nextTick } from "vue";
import { useTagsStore } from "../stores/tags.js";
import { useProductsStore } from "../stores/products.js";

vi.mock("../api/tags.js", () => ({
  fetchTags: vi.fn(),
}));

vi.mock("../api/products.js", () => ({
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  togglePublish: vi.fn(),
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  reorderImages: vi.fn(),
}));

import * as tagsApi from "../api/tags.js";
import * as productsApi from "../api/products.js";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("tagsStore — fetchTags", () => {
  it("populates tags from API", async () => {
    tagsApi.fetchTags.mockResolvedValue({ data: ["素色", "平紋"] });
    const store = useTagsStore();
    await store.fetchTags();
    expect(store.tags).toEqual(["素色", "平紋"]);
  });
});

describe("tagsStore — selection", () => {
  it("selectTag adds to selectedTags", () => {
    const store = useTagsStore();
    store.selectTag("素色");
    expect(store.selectedTags).toContain("素色");
  });

  it("selectTag does not duplicate", () => {
    const store = useTagsStore();
    store.selectTag("素色");
    store.selectTag("素色");
    expect(store.selectedTags.filter((t) => t === "素色").length).toBe(1);
  });

  it("deselectTag removes tag", () => {
    const store = useTagsStore();
    store.selectTag("素色");
    store.deselectTag("素色");
    expect(store.selectedTags).not.toContain("素色");
  });

  it("clearSelection empties selectedTags", () => {
    const store = useTagsStore();
    store.selectTag("素色");
    store.selectTag("平紋");
    store.clearSelection();
    expect(store.selectedTags).toEqual([]);
  });
});

describe("tagsStore — selectedTags watcher triggers productsStore", () => {
  it("calls fetchProducts with selected tags when selection changes", async () => {
    productsApi.fetchProducts.mockResolvedValue({ data: [] });
    const tagsStore = useTagsStore();
    const productsStore = useProductsStore();

    tagsStore.selectTag("素色");
    await nextTick();
    await nextTick();

    expect(productsApi.fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ["素色"] })
    );
  });

  it("calls fetchProducts with empty tags when selection cleared", async () => {
    productsApi.fetchProducts.mockResolvedValue({ data: [] });
    const tagsStore = useTagsStore();
    useProductsStore();

    tagsStore.selectTag("素色");
    await nextTick();
    await nextTick();
    vi.clearAllMocks();
    productsApi.fetchProducts.mockResolvedValue({ data: [] });

    tagsStore.clearSelection();
    await nextTick();
    await nextTick();

    expect(productsApi.fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [] })
    );
  });
});
