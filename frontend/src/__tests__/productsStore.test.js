/**
 * Task 6.1 — productsStore 測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useProductsStore } from "../stores/products.js";

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

import * as api from "../api/products.js";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("productsStore — state", () => {
  it("initial state is empty / false / null", () => {
    const store = useProductsStore();
    expect(store.products).toEqual([]);
    expect(store.currentProduct).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });
});

describe("productsStore — fetchProducts", () => {
  it("populates products on success", async () => {
    api.fetchProducts.mockResolvedValue({ data: [{ id: 1, name_zh: "布A" }] });
    const store = useProductsStore();
    await store.fetchProducts();
    expect(store.products).toEqual([{ id: 1, name_zh: "布A" }]);
    expect(store.loading).toBe(false);
  });

  it("sets error on failure", async () => {
    api.fetchProducts.mockRejectedValue(new Error("網路錯誤"));
    const store = useProductsStore();
    await store.fetchProducts();
    expect(store.error).toBe("網路錯誤");
    expect(store.products).toEqual([]);
  });

  it("passes params to API", async () => {
    api.fetchProducts.mockResolvedValue({ data: [] });
    const store = useProductsStore();
    await store.fetchProducts({ tags: ["素色"] });
    expect(api.fetchProducts).toHaveBeenCalledWith({ tags: ["素色"] });
  });
});

describe("productsStore — fetchProduct", () => {
  it("sets currentProduct on success", async () => {
    api.fetchProduct.mockResolvedValue({ data: { id: 2, name_zh: "布B" } });
    const store = useProductsStore();
    await store.fetchProduct(2);
    expect(store.currentProduct).toEqual({ id: 2, name_zh: "布B" });
  });
});

describe("productsStore — togglePublish (optimistic update)", () => {
  it("updates local state immediately before API call", async () => {
    api.togglePublish.mockResolvedValue({ data: { is_published: true } });
    const store = useProductsStore();
    store.products = [{ id: 1, is_published: false }];

    const promise = store.togglePublish(1, true);
    // Optimistic: already updated before await
    expect(store.products[0].is_published).toBe(true);
    await promise;
  });

  it("rolls back on API failure", async () => {
    api.togglePublish.mockRejectedValue(new Error("server error"));
    const store = useProductsStore();
    store.products = [{ id: 1, is_published: false }];

    await store.togglePublish(1, true);
    expect(store.products[0].is_published).toBe(false);
    expect(store.error).toBe("server error");
  });
});

describe("productsStore — deleteProduct", () => {
  it("removes product from list after deletion", async () => {
    api.deleteProduct.mockResolvedValue({ success: true });
    const store = useProductsStore();
    store.products = [{ id: 1 }, { id: 2 }];
    await store.deleteProduct(1);
    expect(store.products).toEqual([{ id: 2 }]);
  });
});

describe("productsStore — refreshCurrentProduct", () => {
  it("re-fetches current product by id", async () => {
    api.fetchProduct.mockResolvedValue({ data: { id: 5, name_zh: "Updated" } });
    const store = useProductsStore();
    store.currentProduct = { id: 5, name_zh: "Old" };
    await store.refreshCurrentProduct();
    expect(api.fetchProduct).toHaveBeenCalledWith(5);
    expect(store.currentProduct.name_zh).toBe("Updated");
  });

  it("does nothing if no currentProduct", async () => {
    const store = useProductsStore();
    await store.refreshCurrentProduct();
    expect(api.fetchProduct).not.toHaveBeenCalled();
  });
});
