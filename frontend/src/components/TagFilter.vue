<script setup>
import { useTagsStore } from "../stores/tags.js";

const tagsStore = useTagsStore();
</script>

<template>
  <div class="tag-filter">
    <button
      v-for="tag in tagsStore.tags"
      :key="tag"
      :class="['tag-filter__btn', { active: tagsStore.selectedTags.includes(tag) }]"
      @click="tagsStore.selectTag(tag)"
    >
      {{ tag }}
    </button>
    <button
      v-if="tagsStore.selectedTags.length > 0"
      class="tag-filter__clear"
      @click="tagsStore.clearSelection()"
    >
      {{ $t("catalog.allProducts") }}
    </button>
  </div>
</template>
