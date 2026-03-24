<script setup>
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";

const { locale, t } = useI18n();

function switchLocale(lang) {
  locale.value = lang;
  localStorage.setItem("locale", lang);
}

onMounted(() => {
  const saved = localStorage.getItem("locale");
  if (saved && saved !== locale.value) {
    locale.value = saved;
  }
});
</script>

<template>
  <div class="language-switcher" role="group" :aria-label="'語言切換'">
    <button
      :class="{ active: locale === 'zh-TW' }"
      :aria-pressed="locale === 'zh-TW'"
      @click="switchLocale('zh-TW')"
    >
      {{ t("nav.langZhTW") }}
    </button>
    <button
      :class="{ active: locale === 'en' }"
      :aria-pressed="locale === 'en'"
      @click="switchLocale('en')"
    >
      {{ t("nav.langEn") }}
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: flex;
  gap: 0.25rem;
}

.language-switcher button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-sm);
  color: inherit;
  opacity: 0.7;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast), border-bottom var(--transition-fast);
  border-bottom: 2px solid transparent;
}

.language-switcher button:hover {
  opacity: 1;
}

.language-switcher button.active {
  font-weight: 600;
  opacity: 1;
  color: var(--color-secondary);
  border-bottom: 2px solid var(--color-secondary);
}
</style>
