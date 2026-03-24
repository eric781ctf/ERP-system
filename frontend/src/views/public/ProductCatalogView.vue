<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";
import { useTagsStore } from "../../stores/tags.js";
import { useCatalogFilterStore } from "../../stores/catalogFilter.js";
import ProductCard from "../../components/ProductCard.vue";
import SkeletonCard from "../../components/ui/SkeletonCard.vue";
import CatalogHero from "../../components/CatalogHero.vue";
import CatalogSidebar from "../../components/CatalogSidebar.vue";

const { t } = useI18n();
const productsStore = useProductsStore();
const tagsStore = useTagsStore();
const filterStore = useCatalogFilterStore();

const isDrawerOpen = ref(false);

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    tagsStore.fetchTags(),
  ]);
});

function openDrawer() {
  isDrawerOpen.value = true;
}

function closeDrawer() {
  isDrawerOpen.value = false;
}
</script>

<template>
  <div class="catalog-page">
    <!-- Hero section -->
    <CatalogHero />

    <!-- Product list anchor + layout -->
    <div id="product-list" class="catalog-body">
      <!-- Mobile: open filter drawer button -->
      <div class="catalog-body__toolbar">
        <button class="catalog-body__filter-btn" @click="openDrawer">
          {{ t("catalog.filter.openDrawer") }}
        </button>
      </div>

      <div class="catalog-body__layout">
        <!-- Sidebar (desktop always visible; mobile: drawer controlled by isDrawerOpen) -->
        <CatalogSidebar
          v-if="!productsStore.loading"
          :is-open="isDrawerOpen"
          @close="closeDrawer"
        />

        <!-- Overlay for mobile drawer -->
        <div
          v-if="isDrawerOpen"
          class="catalog-drawer-overlay"
          aria-hidden="true"
          @click="closeDrawer"
        />

        <!-- Products area -->
        <main class="catalog-main">
          <div v-if="productsStore.loading" class="catalog-grid">
            <SkeletonCard v-for="n in 6" :key="n" />
          </div>

          <div v-else-if="filterStore.filteredProducts.length === 0 && productsStore.products.length === 0" class="catalog-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <p>{{ t("catalog.noProducts") }}</p>
          </div>

          <div v-else-if="filterStore.filteredProducts.length === 0" class="catalog-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>{{ t("catalog.emptyFiltered") }}</p>
            <button class="catalog-empty__clear-btn" @click="filterStore.clearAllFilters()">
              {{ t("catalog.filter.clearAll") }}
            </button>
          </div>

          <div v-else class="catalog-grid">
            <ProductCard
              v-for="product in filterStore.filteredProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-page {
  background: var(--color-background);
}

.catalog-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

/* Mobile toolbar — open drawer button */
.catalog-body__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
}

.catalog-body__filter-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-cta);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.catalog-body__filter-btn:hover {
  background: var(--color-cta-hover);
}

/* Layout: sidebar + main */
.catalog-body__layout {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}

/* Drawer overlay (mobile) */
.catalog-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--z-modal);
}

.catalog-main {
  flex: 1;
  min-width: 0;
}

/* Product grid — auto-fit with fixed card size to prevent stretching */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 300px));
  gap: var(--space-6);
}

/* Empty state */
.catalog-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.catalog-empty svg {
  opacity: 0.4;
}

.catalog-empty p {
  font-size: var(--font-size-lg);
  margin: 0;
}

.catalog-empty__clear-btn {
  padding: var(--space-2) var(--space-6);
  background: none;
  border: 1px solid var(--color-cta);
  border-radius: var(--radius-base);
  color: var(--color-cta);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.catalog-empty__clear-btn:hover {
  background: var(--color-cta);
  color: var(--color-text-primary);
}

/* Desktop: show sidebar inline, hide toolbar button */
@media (min-width: 1024px) {
  .catalog-body__toolbar {
    display: none;
  }
}

/* Mobile: hide sidebar via CSS (v-if handles aria, but we need to show once open too) */
@media (max-width: 1023px) {
  .catalog-body__layout {
    display: block;
  }
}
</style>
