/**
 * Task 1.2 — API 層結構測試
 */
import { describe, it, expect } from "vitest";

describe("API 層模組結構", () => {
  it("src/api/products.js 應匯出必要的函式", async () => {
    const mod = await import("../api/products.js");
    expect(typeof mod.fetchProducts).toBe("function");
    expect(typeof mod.fetchProduct).toBe("function");
    expect(typeof mod.createProduct).toBe("function");
    expect(typeof mod.updateProduct).toBe("function");
    expect(typeof mod.deleteProduct).toBe("function");
    expect(typeof mod.togglePublish).toBe("function");
    expect(typeof mod.uploadImage).toBe("function");
    expect(typeof mod.deleteImage).toBe("function");
    expect(typeof mod.reorderImages).toBe("function");
  });

  it("src/api/tags.js 應匯出 fetchTags 函式", async () => {
    const mod = await import("../api/tags.js");
    expect(typeof mod.fetchTags).toBe("function");
  });
});

describe("Pinia Store 結構", () => {
  it("productsStore 應匯出 useProductsStore", async () => {
    const mod = await import("../stores/products.js");
    expect(typeof mod.useProductsStore).toBe("function");
  });

  it("tagsStore 應匯出 useTagsStore", async () => {
    const mod = await import("../stores/tags.js");
    expect(typeof mod.useTagsStore).toBe("function");
  });
});
