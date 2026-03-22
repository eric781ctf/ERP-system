<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  images: { type: Array, required: true },
});

const currentIndex = ref(0);

const sorted = computed(() =>
  [...props.images].sort((a, b) => a.sort_order - b.sort_order)
);

const currentImage = computed(() => sorted.value[currentIndex.value] ?? null);

function prev() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function next() {
  if (currentIndex.value < sorted.value.length - 1) currentIndex.value++;
}
</script>

<template>
  <div class="carousel">
    <div v-if="sorted.length === 0" class="carousel-placeholder">
      {{ $t("product.noImage") }}
    </div>

    <template v-else>
      <img
        :src="currentImage.url"
        :alt="`image-${currentImage.sort_order}`"
        class="carousel-image"
        @error="(e) => (e.target.src = '')"
      />

      <div v-if="sorted.length > 1" class="carousel-controls">
        <button class="carousel-prev" :disabled="currentIndex === 0" @click="prev">‹</button>
        <span class="carousel-counter">{{ currentIndex + 1 }} / {{ sorted.length }}</span>
        <button class="carousel-next" :disabled="currentIndex === sorted.length - 1" @click="next">›</button>
      </div>
    </template>
  </div>
</template>
