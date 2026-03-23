<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  product: { type: Object, required: true },
});

const { locale } = useI18n();

const displayName = computed(() => {
  if (locale.value === "en" && props.product.name_en) {
    return props.product.name_en;
  }
  return props.product.name_zh;
});
</script>

<template>
  <div class="product-card">
    <router-link :to="`/products/${product.id}`" class="product-card__link">
      <div class="product-card__image-wrap">
        <img
          v-if="product.cover_image_url"
          :src="product.cover_image_url"
          :alt="displayName"
          class="product-card__image"
          loading="lazy"
        />
        <div v-else class="product-card__no-image">
          <span aria-hidden="true">📦</span>
          {{ $t("product.noImage") }}
        </div>
      </div>

      <div class="product-card__body">
        <h3 class="product-card__name">{{ displayName }}</h3>
        <p v-if="product.composition" class="product-card__composition">
          {{ product.composition }}
        </p>
        <div v-if="product.tags?.length" class="product-card__tags">
          <span
            v-for="tag in product.tags"
            :key="tag"
            class="product-card__tag"
          >{{ tag }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.product-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.product-card__link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-card__image-wrap {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-border);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-card__no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  background: var(--color-border);
}

.product-card__body {
  padding: 1rem;
}

.product-card__name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem;
}

.product-card__composition {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem;
}

.product-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.product-card__tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--color-cta);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-cta);
}
</style>
