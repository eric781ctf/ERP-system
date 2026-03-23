<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";
import ProductImageCarousel from "../../components/ProductImageCarousel.vue";
import SkeletonCard from "../../components/ui/SkeletonCard.vue";

const route = useRoute();
const { locale, t } = useI18n();
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
  <div class="product-detail-page">
    <div v-if="store.loading" class="product-detail-page__skeleton">
      <SkeletonCard />
    </div>

    <div v-else-if="product" class="product-detail">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol class="breadcrumb__list">
          <li>
            <router-link to="/products" class="breadcrumb__link">
              {{ t("catalog.title") }}
            </router-link>
          </li>
          <li aria-current="page" class="breadcrumb__current">
            {{ displayName }}
          </li>
        </ol>
      </nav>

      <div class="product-detail__layout">
        <div class="product-detail__gallery">
          <ProductImageCarousel :images="product.images ?? []" />
        </div>

        <div class="product-detail__info">
          <h1 class="product-detail__name">{{ displayName }}</h1>
          <p v-if="displayDescription" class="product-detail__desc">
            {{ displayDescription }}
          </p>

          <dl v-if="specs.length" class="product-detail__specs">
            <template v-for="spec in specs" :key="spec.key">
              <dt>{{ t(`product.${spec.key}`) }}</dt>
              <dd>{{ spec.value ?? "—" }}</dd>
            </template>
          </dl>

          <div v-if="product.tags?.length" class="product-detail__tags">
            <span v-for="tag in product.tags" :key="tag" class="tag-badge">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem var(--space-6);
}

.product-detail-page__skeleton {
  max-width: 480px;
}

.breadcrumb {
  margin-bottom: 1.5rem;
}

.breadcrumb__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.breadcrumb__list li:not(:last-child)::after {
  content: "›";
  margin-left: 0.5rem;
  color: var(--color-border-hover);
}

.breadcrumb__link {
  color: var(--color-cta);
  text-decoration: none;
}

.breadcrumb__link:hover {
  text-decoration: underline;
}

.breadcrumb__current {
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.product-detail__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .product-detail__layout {
    grid-template-columns: 1fr 1fr;
  }
}

.product-detail__name {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.75rem;
}

.product-detail__desc {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.product-detail__specs {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1.5rem;
  margin: 0 0 1.5rem;
  font-size: var(--font-size-sm);
}

.product-detail__specs dt {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.product-detail__specs dd {
  margin: 0;
  color: var(--color-text-primary);
}

.product-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--color-cta);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-cta);
}
</style>
