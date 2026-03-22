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
    <router-link :to="`/products/${product.id}`">
      <img
        v-if="product.cover_image_url"
        :src="product.cover_image_url"
        :alt="displayName"
        class="product-card__image"
      />
      <div v-else class="product-card__no-image">{{ $t("product.noImage") }}</div>

      <div class="product-card__body">
        <h3 class="product-card__name">{{ displayName }}</h3>
        <p class="product-card__composition">{{ product.composition }}</p>
        <div class="product-card__tags">
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
