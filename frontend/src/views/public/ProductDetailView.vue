<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";
import ProductImageCarousel from "../../components/ProductImageCarousel.vue";

const route = useRoute();
const { locale } = useI18n();
const store = useProductsStore();

onMounted(() => {
  if (route?.params?.id) {
    store.fetchProduct(Number(route.params.id));
  }
});

const product = computed(() => store.currentProduct);

const displayName = computed(() => {
  if (!product.value) return "";
  if (locale.value === "en" && product.value.name_en) return product.value.name_en;
  return product.value.name_zh;
});

const displayDescription = computed(() => {
  if (!product.value) return "";
  if (locale.value === "en" && product.value.description_en) return product.value.description_en;
  return product.value.description_zh;
});

const specs = computed(() => {
  if (!product.value) return [];
  return [
    { key: "composition", value: product.value.composition },
    { key: "yarnCount", value: product.value.yarn_count },
    { key: "density", value: product.value.density },
    { key: "weightGsm", value: product.value.weight_gsm },
    { key: "width", value: product.value.width },
    { key: "weaveStructure", value: product.value.weave_structure },
  ].filter((s) => s.value !== null && s.value !== undefined && s.value !== "");
});
</script>

<template>
  <div v-if="product" class="product-detail">
    <ProductImageCarousel :images="product.images ?? []" />

    <h1 class="product-detail__name">{{ displayName }}</h1>
    <p v-if="displayDescription" class="product-detail__desc">{{ displayDescription }}</p>

    <dl class="product-detail__specs">
      <template v-for="spec in specs" :key="spec.key">
        <dt>{{ $t(`product.${spec.key}`) }}</dt>
        <dd>{{ spec.value }}</dd>
      </template>
    </dl>

    <div v-if="product.tags?.length" class="product-detail__tags">
      <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </div>
  <div v-else-if="store.loading">Loading...</div>
</template>
