import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { fetchTags as apiFetchTags } from "../api/tags.js";
import { useProductsStore } from "./products.js";

export const useTagsStore = defineStore("tags", () => {
  const tags = ref([]);
  const selectedTags = ref([]);

  async function fetchTags() {
    const res = await apiFetchTags();
    tags.value = res.data;
  }

  function selectTag(tag) {
    if (!selectedTags.value.includes(tag)) {
      selectedTags.value = [...selectedTags.value, tag];
    }
  }

  function deselectTag(tag) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  }

  function clearSelection() {
    selectedTags.value = [];
  }

  // When selectedTags changes, re-fetch products filtered by active tags
  watch(selectedTags, (tags) => {
    useProductsStore().fetchProducts({ tags });
  });

  return { tags, selectedTags, fetchTags, selectTag, deselectTag, clearSelection };
});
