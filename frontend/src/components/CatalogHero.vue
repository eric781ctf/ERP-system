<script setup>
import { onMounted } from "vue";
import { useCatalogHeroStore } from "../stores/catalogHero.js";

const store = useCatalogHeroStore();

onMounted(() => {
  store.fetchHero();
});
</script>

<template>
  <section class="catalog-hero" aria-labelledby="catalog-hero-title">
    <div class="catalog-hero__content">
      <template v-if="store.loading">
        <div class="catalog-hero__skeleton catalog-hero__skeleton--title" aria-hidden="true" />
        <div class="catalog-hero__skeleton catalog-hero__skeleton--description" aria-hidden="true" />
      </template>
      <template v-else>
        <h1 id="catalog-hero-title" class="catalog-hero__title">
          {{ store.heroTitle }}
        </h1>
        <p class="catalog-hero__description">
          {{ store.heroDescription }}
        </p>
      </template>
    </div>
  </section>
</template>

<style scoped>
.catalog-hero {
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-background-warm) 100%);
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.catalog-hero__content {
  max-width: 720px;
  margin: 0 auto;
}

.catalog-hero__title {
  font-size: clamp(1.5rem, 5vw, var(--font-size-3xl));
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 var(--space-4);
  line-height: var(--line-height-heading);
}

.catalog-hero__description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-base);
}

.catalog-hero__skeleton {
  background: var(--color-background-warm, #f0ece6);
  border-radius: var(--radius-base, 4px);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  margin: 0 auto;
}

.catalog-hero__skeleton--title {
  height: 2.5rem;
  width: 60%;
  margin-bottom: var(--space-4);
}

.catalog-hero__skeleton--description {
  height: 1.25rem;
  width: 80%;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .catalog-hero {
    padding: var(--space-8) var(--space-4);
  }

  .catalog-hero__description {
    font-size: var(--font-size-base);
  }
}
</style>
