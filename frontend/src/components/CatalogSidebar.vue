<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCatalogFilterStore } from "../stores/catalogFilter.js";

const { t } = useI18n();
const filterStore = useCatalogFilterStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

// Focus trap for mobile drawer
const drawerRef = ref(null);

function getFocusableElements() {
  if (!drawerRef.value) return [];
  return Array.from(
    drawerRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.disabled);
}

function handleKeyDown(event) {
  if (event.key === "Escape") {
    emit("close");
    return;
  }

  if (event.key === "Tab") {
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <!-- Desktop sidebar (always visible >= 1024px) or mobile drawer (conditional) -->
  <aside
    ref="drawerRef"
    class="catalog-sidebar"
    :class="{ 'catalog-sidebar--open': isOpen }"
    :aria-hidden="!isOpen ? 'true' : undefined"
    aria-label="t('catalog.filter.title')"
  >
    <div class="catalog-sidebar__header">
      <h2 class="catalog-sidebar__title">{{ t("catalog.filter.title") }}</h2>
      <!-- Close button for mobile drawer -->
      <button
        class="catalog-sidebar__close-btn"
        :aria-label="t('catalog.filter.closeDrawer')"
        @click="emit('close')"
      >
        &times;
      </button>
    </div>

    <!-- Category filter (only shown when options exist) -->
    <div v-if="filterStore.availableFilters.categories.length" class="catalog-sidebar__group">
      <fieldset class="catalog-sidebar__fieldset">
        <legend class="catalog-sidebar__group-title">{{ t("catalog.filter.category") }}</legend>
        <label
          v-for="cat in filterStore.availableFilters.categories"
          :key="cat"
          class="catalog-sidebar__option"
        >
          <input
            type="checkbox"
            :value="cat"
            :checked="filterStore.selectedCategories.includes(cat)"
            class="catalog-sidebar__checkbox"
            @change="filterStore.toggleFilter('category', cat)"
          />
          {{ cat }}
        </label>
      </fieldset>
    </div>

    <!-- Composition filter (only shown when options exist) -->
    <div v-if="filterStore.availableFilters.compositions.length" class="catalog-sidebar__group">
      <fieldset class="catalog-sidebar__fieldset">
        <legend class="catalog-sidebar__group-title">{{ t("catalog.filter.composition") }}</legend>
        <label
          v-for="comp in filterStore.availableFilters.compositions"
          :key="comp"
          class="catalog-sidebar__option"
        >
          <input
            type="checkbox"
            :value="comp"
            :checked="filterStore.selectedCompositions.includes(comp)"
            class="catalog-sidebar__checkbox"
            @change="filterStore.toggleFilter('composition', comp)"
          />
          {{ comp }}
        </label>
      </fieldset>
    </div>

    <!-- Weave Structure filter (only shown when options exist) -->
    <div v-if="filterStore.availableFilters.weaveStructures.length" class="catalog-sidebar__group">
      <fieldset class="catalog-sidebar__fieldset">
        <legend class="catalog-sidebar__group-title">{{ t("catalog.filter.weaveStructure") }}</legend>
        <label
          v-for="weave in filterStore.availableFilters.weaveStructures"
          :key="weave"
          class="catalog-sidebar__option"
        >
          <input
            type="checkbox"
            :value="weave"
            :checked="filterStore.selectedWeaveStructures.includes(weave)"
            class="catalog-sidebar__checkbox"
            @change="filterStore.toggleFilter('weaveStructure', weave)"
          />
          {{ weave }}
        </label>
      </fieldset>
    </div>

    <!-- Clear all filters -->
    <button
      v-if="filterStore.hasActiveFilters"
      class="catalog-sidebar__clear-btn"
      @click="filterStore.clearAllFilters()"
    >
      {{ t("catalog.filter.clearAll") }}
    </button>
  </aside>
</template>

<style scoped>
.catalog-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  align-self: flex-start;
}

.catalog-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.catalog-sidebar__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.catalog-sidebar__close-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.25rem;
  line-height: 1;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.catalog-sidebar__close-btn:hover {
  color: var(--color-primary);
}

.catalog-sidebar__group {
  margin-bottom: var(--space-6);
}

.catalog-sidebar__fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

.catalog-sidebar__group-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-3);
  padding: 0;
}

.catalog-sidebar__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.catalog-sidebar__option:hover {
  background: var(--color-background-warm);
  color: var(--color-primary);
}

.catalog-sidebar__checkbox {
  accent-color: var(--color-cta);
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.catalog-sidebar__clear-btn {
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: none;
  border: 1px solid var(--color-cta);
  border-radius: var(--radius-base);
  color: var(--color-cta);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  margin-top: var(--space-4);
}

.catalog-sidebar__clear-btn:hover {
  background: var(--color-cta);
  color: var(--color-text-primary);
}

/* Mobile Drawer — hidden by default on small screens, shown via isOpen prop */
@media (max-width: 1023px) {
  .catalog-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: min(320px, 90vw);
    z-index: calc(var(--z-modal) + 1);
    border-radius: 0;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    /* Use v-if logic in parent — when not open, hidden with aria-hidden */
  }

  .catalog-sidebar--open {
    transform: translateX(0);
  }

  .catalog-sidebar__close-btn {
    display: block;
  }
}

/* Desktop sidebar — always visible, fixed width */
@media (min-width: 1024px) {
  .catalog-sidebar {
    transform: none !important;
  }
}
</style>
