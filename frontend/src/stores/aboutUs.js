import { ref } from "vue";
import { defineStore } from "pinia";
import * as api from "../api/aboutUs.js";

export const useAboutUsStore = defineStore("aboutUs", () => {
  const aboutUs = ref(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref(null);

  async function fetchAboutUs() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.fetchAboutUs();
      aboutUs.value = res.data;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
    } finally {
      loading.value = false;
    }
  }

  async function updateAboutUs(payload) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.updateAboutUs(payload);
      aboutUs.value = res.data;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
    } finally {
      saving.value = false;
    }
  }

  return {
    aboutUs,
    loading,
    saving,
    error,
    fetchAboutUs,
    updateAboutUs,
  };
});
