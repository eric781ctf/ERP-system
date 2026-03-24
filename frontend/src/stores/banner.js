import { ref } from "vue";
import { defineStore } from "pinia";
import * as api from "../api/banners.js";

export const useBannerStore = defineStore("banner", () => {
  const banners = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchBanners() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.fetchBanners();
      banners.value = res.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createBanner(formData) {
    error.value = null;
    try {
      const res = await api.createBanner(formData);
      banners.value.push(res.data);
      return res.data;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
      throw e;
    }
  }

  async function updateBanner(id, payload) {
    error.value = null;
    try {
      const res = await api.updateBanner(id, payload);
      const idx = banners.value.findIndex((b) => b.id === id);
      if (idx !== -1) banners.value[idx] = res.data;
      return res.data;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
      throw e;
    }
  }

  async function deleteBanner(id) {
    error.value = null;
    try {
      await api.deleteBanner(id);
      banners.value = banners.value.filter((b) => b.id !== id);
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
      throw e;
    }
  }

  async function reorderBanners(orderedIds) {
    error.value = null;
    try {
      const res = await api.reorderBanners(orderedIds);
      banners.value = res.data;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
      throw e;
    }
  }

  async function toggleActive(id, isActive) {
    error.value = null;
    try {
      await api.toggleActive(id, isActive);
      const idx = banners.value.findIndex((b) => b.id === id);
      if (idx !== -1) banners.value[idx].is_active = isActive;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
      throw e;
    }
  }

  return {
    banners,
    loading,
    error,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    toggleActive,
  };
});
