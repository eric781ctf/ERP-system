import { defineStore } from "pinia";
import { ref } from "vue";
import * as api from "../api/products.js";

export const useProductsStore = defineStore("products", () => {
  const products = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchProducts(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.fetchProducts(params);
      products.value = res.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.fetchProduct(id);
      currentProduct.value = res.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function refreshCurrentProduct() {
    if (currentProduct.value?.id) {
      await fetchProduct(currentProduct.value.id);
    }
  }

  async function togglePublish(id, isPublished) {
    // Optimistic update
    const target = products.value.find((p) => p.id === id);
    const previous = target?.is_published;
    if (target) target.is_published = isPublished;

    try {
      await api.togglePublish(id, isPublished);
    } catch (e) {
      // Rollback
      if (target) target.is_published = previous;
      error.value = e.message;
    }
  }

  async function createProduct(payload) {
    const res = await api.createProduct(payload);
    return res.data;
  }

  async function updateProduct(id, payload) {
    const res = await api.updateProduct(id, payload);
    const updated = res.data;
    const idx = products.value.findIndex((p) => p.id === id);
    if (idx !== -1) products.value[idx] = { ...products.value[idx], ...updated };
    if (currentProduct.value?.id === id) currentProduct.value = updated;
    return updated;
  }

  async function deleteProduct(id) {
    await api.deleteProduct(id);
    products.value = products.value.filter((p) => p.id !== id);
  }

  return {
    products,
    currentProduct,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    refreshCurrentProduct,
    createProduct,
    updateProduct,
    togglePublish,
    deleteProduct,
  };
});
