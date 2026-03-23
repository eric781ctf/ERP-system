<script setup>
import { useTagsStore } from "../stores/tags.js";

const tagsStore = useTagsStore();
</script>

<template>
  <div class="tag-filter" role="group" aria-label="依標籤篩選">
    <button
      v-for="tag in tagsStore.tags"
      :key="tag"
      :class="['tag-filter__btn', { active: tagsStore.selectedTags.includes(tag) }]"
      :aria-pressed="tagsStore.selectedTags.includes(tag)"
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

<style scoped>
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag-filter__btn {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background var(--transition-base), color var(--transition-base), border-color var(--transition-base);
}

.tag-filter__btn:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.tag-filter__btn.active {
  background: var(--color-cta);
  color: #fff;
  border-color: var(--color-cta);
}

.tag-filter__clear {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border-hover);
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background var(--transition-base);
}

.tag-filter__clear:hover {
  background: var(--color-border);
}
</style>
