<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function scrollToProductList() {
  const el = document.getElementById("product-list");
  if (!el) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}
</script>

<template>
  <section class="catalog-hero" aria-labelledby="catalog-hero-title">
    <div class="catalog-hero__content">
      <h1 id="catalog-hero-title" class="catalog-hero__title">
        {{ t("catalog.hero.title") }}
      </h1>
      <p class="catalog-hero__description">
        {{ t("catalog.hero.description") }}
      </p>
      <button class="catalog-hero__cta" @click="scrollToProductList">
        {{ t("catalog.hero.cta") }}
      </button>
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
  margin: 0 0 var(--space-8);
  line-height: var(--line-height-base);
}

.catalog-hero__cta {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--color-cta);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-base), box-shadow var(--transition-base);
  text-decoration: none;
}

.catalog-hero__cta:hover {
  background: var(--color-cta-hover);
  box-shadow: var(--shadow-card-hover);
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
