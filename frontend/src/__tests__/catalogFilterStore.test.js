/**
 * Task 4.2 — useCatalogFilterStore unit tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCatalogFilterStore } from "../stores/catalogFilter.js";
import { useProductsStore } from "../stores/products.js";

const SAMPLE_PRODUCTS = [
  { id: 1, name_zh: "布A", category: "梭織", composition: "Polyester", weave_structure: "平紋" },
  { id: 2, name_zh: "布B", category: "針織", composition: "棉", weave_structure: "針織" },
  { id: 3, name_zh: "布C", category: "梭織", composition: "麻", weave_structure: "斜紋" },
  { id: 4, name_zh: "布D", category: "梭織", composition: "Polyester", weave_structure: "斜紋" },
  { id: 5, name_zh: "布E", category: null, composition: "", weave_structure: null },
];

beforeEach(() => {
  setActivePinia(createPinia());
  // Seed products into productsStore
  const productsStore = useProductsStore();
  productsStore.products = SAMPLE_PRODUCTS;
});

describe("useCatalogFilterStore — initial state", () => {
  it("starts with no selected filters", () => {
    const store = useCatalogFilterStore();
    expect(store.selectedCategories).toEqual([]);
    expect(store.selectedCompositions).toEqual([]);
    expect(store.selectedWeaveStructures).toEqual([]);
  });

  it("hasActiveFilters is false when no filters selected", () => {
    const store = useCatalogFilterStore();
    expect(store.hasActiveFilters).toBe(false);
  });
});

describe("useCatalogFilterStore — availableFilters", () => {
  it("extracts unique non-empty category values", () => {
    const store = useCatalogFilterStore();
    // null and "" should be excluded
    expect(store.availableFilters.categories).toEqual(["梭織", "針織"]);
  });

  it("extracts unique non-empty composition values", () => {
    const store = useCatalogFilterStore();
    expect(store.availableFilters.compositions).toEqual(["Polyester", "棉", "麻"]);
  });

  it("extracts unique non-empty weaveStructure values", () => {
    const store = useCatalogFilterStore();
    expect(store.availableFilters.weaveStructures).toEqual(["平紋", "斜紋", "針織"]);
  });
});

describe("useCatalogFilterStore — toggleFilter", () => {
  it("adds a value when not selected", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    expect(store.selectedCategories).toContain("梭織");
  });

  it("removes a value when already selected", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    store.toggleFilter("category", "梭織");
    expect(store.selectedCategories).not.toContain("梭織");
  });

  it("does nothing for unknown dimension", () => {
    const store = useCatalogFilterStore();
    expect(() => store.toggleFilter("unknown", "foo")).not.toThrow();
  });

  it("toggleFilter updates hasActiveFilters", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("composition", "棉");
    expect(store.hasActiveFilters).toBe(true);
  });
});

describe("useCatalogFilterStore — filteredProducts (AND cross-dimension, OR within)", () => {
  it("returns all products when no filter is active", () => {
    const store = useCatalogFilterStore();
    expect(store.filteredProducts).toHaveLength(SAMPLE_PRODUCTS.length);
  });

  it("filters by single category (OR within dimension)", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    const results = store.filteredProducts;
    expect(results.every((p) => p.category === "梭織")).toBe(true);
  });

  it("filters by multiple categories using OR logic", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    store.toggleFilter("category", "針織");
    const results = store.filteredProducts;
    // Both 梭織 and 針織 products should appear
    expect(results.some((p) => p.category === "梭織")).toBe(true);
    expect(results.some((p) => p.category === "針織")).toBe(true);
  });

  it("applies AND logic across dimensions — composition AND weaveStructure", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("composition", "Polyester");
    store.toggleFilter("weaveStructure", "斜紋");
    const results = store.filteredProducts;
    // Only product id=4 matches both Polyester composition AND 斜紋 weaveStructure
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(4);
  });

  it("returns empty array when no product matches cross-dimension AND filter", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("composition", "棉");
    store.toggleFilter("weaveStructure", "平紋"); // no product has composition=棉 AND weave=平紋
    expect(store.filteredProducts).toHaveLength(0);
  });
});

describe("useCatalogFilterStore — clearAllFilters", () => {
  it("resets all filter dimensions", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    store.toggleFilter("composition", "棉");
    store.toggleFilter("weaveStructure", "平紋");
    store.clearAllFilters();
    expect(store.selectedCategories).toEqual([]);
    expect(store.selectedCompositions).toEqual([]);
    expect(store.selectedWeaveStructures).toEqual([]);
  });

  it("filteredProducts returns all products after clearAllFilters", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    store.clearAllFilters();
    expect(store.filteredProducts).toHaveLength(SAMPLE_PRODUCTS.length);
  });

  it("hasActiveFilters returns false after clearAllFilters", () => {
    const store = useCatalogFilterStore();
    store.toggleFilter("category", "梭織");
    store.clearAllFilters();
    expect(store.hasActiveFilters).toBe(false);
  });
});
