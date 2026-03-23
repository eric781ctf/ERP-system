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

function goTo(index) {
  currentIndex.value = index;
}
</script>

<template>
  <div class="carousel">
    <div v-if="sorted.length === 0" class="carousel__placeholder">
      <span aria-hidden="true">📷</span>
      {{ $t("product.noImage") }}
    </div>

    <template v-else>
      <div class="carousel__main">
        <button
          v-if="sorted.length > 1"
          class="carousel__arrow carousel__arrow--prev"
          :disabled="currentIndex === 0"
          aria-label="上一張"
          @click="prev"
        >
          ‹
        </button>

        <div class="carousel__image-wrap">
          <Transition name="carousel-fade" mode="out-in">
            <img
              :key="currentImage.sort_order"
              :src="currentImage.url"
              :alt="`圖片 ${currentIndex + 1}`"
              class="carousel__image"
              @error="(e) => (e.target.src = '')"
            />
          </Transition>
        </div>

        <button
          v-if="sorted.length > 1"
          class="carousel__arrow carousel__arrow--next"
          :disabled="currentIndex === sorted.length - 1"
          aria-label="下一張"
          @click="next"
        >
          ›
        </button>
      </div>

      <!-- Thumbnails -->
      <div v-if="sorted.length > 1" class="carousel__thumbs">
        <button
          v-for="(img, i) in sorted"
          :key="img.sort_order"
          class="carousel__thumb"
          :class="{ 'carousel__thumb--active': i === currentIndex }"
          :aria-label="`顯示圖片 ${i + 1}`"
          @click="goTo(i)"
        >
          <img :src="img.url" :alt="`縮圖 ${i + 1}`" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.carousel {
  width: 100%;
}

.carousel__placeholder {
  aspect-ratio: 4 / 3;
  background: var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.carousel__main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.carousel__image-wrap {
  flex: 1;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-border);
}

.carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel__arrow {
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.carousel__arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel__arrow:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.65);
}

.carousel__thumbs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
}

.carousel__thumb {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-base);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  background: none;
  flex-shrink: 0;
  transition: border-color var(--transition-fast);
}

.carousel__thumb--active {
  border-color: var(--color-cta);
}

.carousel__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity var(--transition-base);
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}
</style>
