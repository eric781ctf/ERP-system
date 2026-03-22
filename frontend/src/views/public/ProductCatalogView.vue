<script setup>
import { onMounted } from "vue";
import { useProductsStore } from "../../stores/products.js";
import { useTagsStore } from "../../stores/tags.js";
import ProductCard from "../../components/ProductCard.vue";
import TagFilter from "../../components/TagFilter.vue";

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
    <h1>{{ $t("catalog.title") }}</h1>

    <TagFilter />

    <p v-if="productsStore.loading">Loading...</p>
    <p v-else-if="productsStore.products.length === 0">
      {{ $t("catalog.noProducts") }}
    </p>
    <div v-else class="catalog-grid">
      <ProductCard
        v-for="product in productsStore.products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>
