<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { locale, t } = useI18n();

const isOpen = ref(false);
const dropdownRef = ref(null);

const LOCALES = [
  { code: "zh-TW", labelKey: "layout.nav.langZhTW" },
  { code: "en", labelKey: "layout.nav.langEn" },
];

function switchLocale(code) {
  locale.value = code;
  localStorage.setItem("locale", code);
  isOpen.value = false;
}

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
}

function handleKeydown(event) {
  if (!isOpen.value) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      isOpen.value = true;
    }
    return;
  }

  if (event.key === "Escape") {
    isOpen.value = false;
    dropdownRef.value?.querySelector("button")?.focus();
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const items = dropdownRef.value?.querySelectorAll('[role="menuitem"]');
    if (!items || items.length === 0) return;
    const focused = document.activeElement;
    const idx = Array.from(items).indexOf(focused);
    if (event.key === "ArrowDown") {
      const next = items[(idx + 1) % items.length];
      next?.focus();
    } else {
      const prev = items[(idx - 1 + items.length) % items.length];
      prev?.focus();
    }
  }
}

onMounted(() => {
  const saved = localStorage.getItem("locale");
  if (saved && saved !== locale.value) {
    locale.value = saved;
  }
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="lang-switcher"
    @keydown="handleKeydown"
  >
    <!-- Globe icon button -->
    <button
      class="lang-switcher__btn"
      :aria-label="t('layout.nav.langSwitcher.label')"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggleOpen"
    >
      <!-- Heroicons globe-alt (outline) 24×24 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="lang-switcher__dropdown"
      role="menu"
    >
      <button
        v-for="loc in LOCALES"
        :key="loc.code"
        class="lang-switcher__option"
        :class="{ 'lang-switcher__option--active': locale === loc.code }"
        role="menuitem"
        @click="switchLocale(loc.code)"
      >
        <span class="lang-switcher__check" aria-hidden="true">
          {{ locale === loc.code ? "✓" : "" }}
        </span>
        {{ t(loc.labelKey) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.lang-switcher__btn {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: var(--radius-sm, 4px);
  opacity: 0.8;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.lang-switcher__btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

.lang-switcher__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  z-index: 50;
  overflow: hidden;
}

.lang-switcher__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #334155);
  cursor: pointer;
  transition: background 0.12s ease;
}

.lang-switcher__option:hover {
  background: var(--color-background-warm, #f8fafc);
}

.lang-switcher__option--active {
  font-weight: 700;
  color: var(--color-primary, #0369a1);
}

.lang-switcher__check {
  width: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-primary, #0369a1);
  flex-shrink: 0;
}
</style>
