import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useProductsStore } from "./products.js";

export const useCatalogFilterStore = defineStore("catalogFilter", () => {
  // Obtain the products store at setup top-level so that all computed
  // properties establish a stable reactive dependency on productsStore.products
  // from the moment the store is initialized, rather than deferring the
  // store lookup to each individual getter execution.
  const productsStore = useProductsStore();

  // Selected filter arrays (one per dimension)
  const selectedCategories = ref([]);
  const selectedCompositions = ref([]);
  const selectedWeaveStructures = ref([]);

  // Derive available filter options from loaded products
  const availableFilters = computed(() => {
    const products = productsStore.products ?? [];

    const categories = [...new Set(
      products.map((p) => p.category).filter((v) => v !== null && v !== undefined && v !== "")
    )].sort();

    const compositions = [...new Set(
      products.map((p) => p.composition).filter((v) => v !== null && v !== undefined && v !== "")
    )].sort();

    const weaveStructures = [...new Set(
      products.map((p) => p.weave_structure).filter((v) => v !== null && v !== undefined && v !== "")
    )].sort();

    return { categories, compositions, weaveStructures };
  });

  // hasActiveFilters — true when any dimension has selections
  const hasActiveFilters = computed(() => {
    return (
      selectedCategories.value.length > 0 ||
      selectedCompositions.value.length > 0 ||
      selectedWeaveStructures.value.length > 0
    );
  });

  // filteredProducts — AND across dimensions, OR within dimension
  const filteredProducts = computed(() => {
    const products = productsStore.products ?? [];

    if (!hasActiveFilters.value) return products;

    return products.filter((product) => {
      const categoryMatch =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(product.category);

      const compositionMatch =
        selectedCompositions.value.length === 0 ||
        selectedCompositions.value.includes(product.composition);

      const weaveMatch =
        selectedWeaveStructures.value.length === 0 ||
        selectedWeaveStructures.value.includes(product.weave_structure);

      return categoryMatch && compositionMatch && weaveMatch;
    });
  });

  /**
   * Toggle a filter value for the given dimension.
   * @param {'category' | 'composition' | 'weaveStructure'} dimension
   * @param {string} value
   */
  function toggleFilter(dimension, value) {
    const map = {
      category: selectedCategories,
      composition: selectedCompositions,
      weaveStructure: selectedWeaveStructures,
    };
    const list = map[dimension];
    if (!list) return;

    const idx = list.value.indexOf(value);
    if (idx === -1) {
      list.value = [...list.value, value];
    } else {
      list.value = list.value.filter((v) => v !== value);
    }
  }

  function clearAllFilters() {
    selectedCategories.value = [];
    selectedCompositions.value = [];
    selectedWeaveStructures.value = [];
  }

  return {
    selectedCategories,
    selectedCompositions,
    selectedWeaveStructures,
    availableFilters,
    hasActiveFilters,
    filteredProducts,
    toggleFilter,
    clearAllFilters,
  };
});
