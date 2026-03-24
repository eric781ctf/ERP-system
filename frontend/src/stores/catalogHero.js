import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as api from "../api/catalogHero.js";

const DEFAULT_TITLE = "探索優質布料與紡織品";
const DEFAULT_DESCRIPTION =
  "專業布料供應，提供多元材質、豐富組織結構，滿足您的紡織製造需求。";

export const useCatalogHeroStore = defineStore("catalogHero", () => {
  const hero = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const heroTitle = computed(() => hero.value?.title || DEFAULT_TITLE);
  const heroDescription = computed(
    () => hero.value?.description || DEFAULT_DESCRIPTION
  );

  async function fetchHero() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.getHero();
      hero.value = res.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function updateHero(payload) {
    error.value = null;
    try {
      const res = await api.updateHero(payload);
      hero.value = res.data;
      return res.data;
    } catch (e) {
      error.value = e.response?.data?.message || e.message;
      throw e;
    }
  }

  return {
    hero,
    loading,
    error,
    heroTitle,
    heroDescription,
    fetchHero,
    updateHero,
  };
});
