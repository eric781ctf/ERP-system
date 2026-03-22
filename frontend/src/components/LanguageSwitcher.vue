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
  <div class="language-switcher">
    <button
      :class="{ active: locale === 'zh-TW' }"
      @click="switchLocale('zh-TW')"
    >
      {{ t("nav.langZhTW") }}
    </button>
    <button
      :class="{ active: locale === 'en' }"
      @click="switchLocale('en')"
    >
      {{ t("nav.langEn") }}
    </button>
  </div>
</template>
