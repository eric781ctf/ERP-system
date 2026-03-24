<template>
  <section
    v-if="banners.length"
    class="carousel"
    role="region"
    :aria-label="t('carousel.ariaLabel')"
    @mouseenter="pause"
    @mouseleave="resume"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Slides -->
    <div class="carousel__track">
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="carousel__slide"
        :class="{ 'carousel__slide--active': index === current }"
        aria-hidden="index !== current"
      >
        <img
          :src="banner.image_url"
          :alt="banner.alt_text || ''"
          class="carousel__img"
          :loading="index === 0 ? 'eager' : 'lazy'"
        />
        <div v-if="banner.title || banner.description || banner.link_url" class="carousel__overlay">
          <h2 v-if="banner.title" class="carousel__title">{{ banner.title }}</h2>
          <p v-if="banner.description" class="carousel__desc">{{ banner.description }}</p>
          <a
            v-if="banner.link_url"
            :href="banner.link_url"
            class="carousel__cta"
          >{{ t('carousel.learnMore') }}</a>
        </div>
      </div>
    </div>

    <!-- Arrows (hidden on mobile) -->
    <button class="carousel__arrow carousel__arrow--prev" :aria-label="t('carousel.prev')" @click="prev">&#8249;</button>
    <button class="carousel__arrow carousel__arrow--next" :aria-label="t('carousel.next')" @click="next">&#8250;</button>

    <!-- Dots -->
    <div class="carousel__dots" role="tablist">
      <button
        v-for="(_, index) in banners"
        :key="index"
        class="carousel__dot"
        :class="{ 'carousel__dot--active': index === current }"
        role="tab"
        :aria-selected="index === current"
        :aria-label="`${t('carousel.slide')} ${index + 1}`"
        @click="goTo(index)"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  banners: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();
const current = ref(0);
let intervalId = null;
let touchStartX = 0;

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function goTo(index) {
  current.value = (index + props.banners.length) % props.banners.length;
}

function next() {
  goTo(current.value + 1);
}

function prev() {
  goTo(current.value - 1);
}

function startAutoplay() {
  if (reducedMotion || props.banners.length <= 1) return;
  intervalId = setInterval(next, 3000);
}

function stopAutoplay() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function pause() {
  stopAutoplay();
}

function resume() {
  startAutoplay();
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function onTouchEnd(e) {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) >= 50) {
    delta > 0 ? next() : prev();
  }
}

onMounted(startAutoplay);
onUnmounted(stopAutoplay);
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #0f172a;
}

.carousel__track {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 5;
}

@media (max-width: 639px) {
  .carousel__track {
    aspect-ratio: 4 / 3;
  }
}

.carousel__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .carousel__slide {
    transition: none;
  }
}

.carousel__slide--active {
  opacity: 1;
}

.carousel__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  color: #fff;
}

.carousel__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.375rem;
  line-height: 1.2;
}

.carousel__desc {
  font-size: 0.9375rem;
  margin: 0 0 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.9;
}

.carousel__cta {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: #fff;
  color: #0f172a;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  align-self: flex-start;
  transition: background 0.15s ease-out;
}

.carousel__cta:hover {
  background: #e2e8f0;
}

/* Arrows */
.carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  z-index: 2;
  transition: background 0.15s ease-out;
}

.carousel__arrow:hover {
  background: rgba(0, 0, 0, 0.65);
}

.carousel__arrow:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.carousel__arrow--prev {
  left: 0.75rem;
}

.carousel__arrow--next {
  right: 0.75rem;
}

@media (max-width: 639px) {
  .carousel__arrow {
    display: none;
  }
}

/* Dots */
.carousel__dots {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.375rem;
  z-index: 2;
}

.carousel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease-out, transform 0.15s ease-out;
}

.carousel__dot:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.carousel__dot--active {
  background: #fff;
  transform: scale(1.25);
}
</style>
