<script setup>
import { onMounted } from "vue";
import { useProductsStore } from "../../stores/products.js";
import { useTagsStore } from "../../stores/tags.js";
import ProductCard from "../../components/ProductCard.vue";
import TagFilter from "../../components/TagFilter.vue";
import SkeletonCard from "../../components/ui/SkeletonCard.vue";

const productsStore = useProductsStore();
const tagsStore = useTagsStore();

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    tagsStore.fetchTags(),
  ]);
});
</script>

<template>
  <div class="catalog-page">
    <div class="catalog-page__header">
      <h1>{{ $t("catalog.title") }}</h1>
    </div>

    <TagFilter />

    <div v-if="productsStore.loading" class="catalog-grid">
      <SkeletonCard v-for="n in 3" :key="n" />
    </div>

    <div v-else-if="productsStore.products.length === 0" class="catalog-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
      <p>{{ $t("catalog.noProducts") }}</p>
    </div>

    <div v-else class="catalog-grid">
      <ProductCard
        v-for="product in productsStore.products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<style scoped>
.catalog-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem var(--space-6);
}

.catalog-page__header h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

.catalog-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.catalog-empty svg {
  opacity: 0.4;
}

.catalog-empty p {
  font-size: var(--font-size-lg);
  margin: 0;
}
</style>
