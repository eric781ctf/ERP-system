<template>
  <div class="about-view">
    <div class="about-view__container">
      <h1 class="about-view__title">{{ t("aboutUs.page.title") }}</h1>

      <!-- Loading state -->
      <div v-if="aboutUsStore.loading" class="about-view__loading" aria-live="polite">
        <span class="about-view__spinner" aria-hidden="true"></span>
      </div>

      <!-- Error state -->
      <div v-else-if="aboutUsStore.error" class="about-view__error" role="alert">
        {{ t("aboutUs.page.loadingError") }}
      </div>

      <!-- Content -->
      <template v-else>
        <!-- 公司簡介 -->
        <section class="about-view__section">
          <h2 class="about-view__section-title">{{ t("aboutUs.page.companyIntro") }}</h2>
          <p class="about-view__section-body">
            {{ companyIntro || t("aboutUs.page.emptyPlaceholder") }}
          </p>
        </section>

        <!-- 品牌故事 -->
        <section class="about-view__section">
          <h2 class="about-view__section-title">{{ t("aboutUs.page.brandStory") }}</h2>
          <p class="about-view__section-body">
            {{ brandStory || t("aboutUs.page.emptyPlaceholder") }}
          </p>
        </section>

        <!-- 聯絡方式 -->
        <section class="about-view__section">
          <h2 class="about-view__section-title">{{ t("aboutUs.page.contactInfo") }}</h2>
          <dl class="about-view__contact-list">
            <template v-if="contactData.fax">
              <dt>{{ t("aboutUs.page.fax") }}</dt>
              <dd>{{ contactData.fax }}</dd>
            </template>
            <template v-if="contactData.address">
              <dt>{{ t("aboutUs.page.address") }}</dt>
              <dd>{{ contactData.address }}</dd>
            </template>
            <template v-if="contactData.businessHours">
              <dt>{{ t("aboutUs.page.businessHours") }}</dt>
              <dd>{{ contactData.businessHours }}</dd>
            </template>
            <template v-if="contactData.email">
              <dt>{{ t("aboutUs.page.email") }}</dt>
              <dd>{{ contactData.email }}</dd>
            </template>
            <template v-if="!contactData.fax && !contactData.address && !contactData.businessHours && !contactData.email">
              <dd>{{ t("aboutUs.page.emptyPlaceholder") }}</dd>
            </template>
          </dl>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAboutUsStore } from "../../stores/aboutUs.js";

const { t, locale } = useI18n();
const aboutUsStore = useAboutUsStore();

const companyIntro = computed(() => {
  const d = aboutUsStore.aboutUs;
  if (!d) return "";
  return locale.value === "zh-TW" ? d.company_intro_zh : d.company_intro_en;
});

const brandStory = computed(() => {
  const d = aboutUsStore.aboutUs;
  if (!d) return "";
  return locale.value === "zh-TW" ? d.brand_story_zh : d.brand_story_en;
});

const contactData = computed(() => {
  const d = aboutUsStore.aboutUs;
  if (!d) return {};
  const isZh = locale.value === "zh-TW";
  return {
    fax: d.fax || "",
    address: isZh ? (d.address_zh || "") : (d.address_en || ""),
    businessHours: isZh ? (d.business_hours_zh || "") : (d.business_hours_en || ""),
    email: d.email || "",
  };
});

onMounted(() => {
  aboutUsStore.fetchAboutUs();
});
</script>

<style scoped>
.about-view {
  min-height: 60vh;
  padding: 2rem 1rem;
}

.about-view__container {
  max-width: 800px;
  margin: 0 auto;
}

.about-view__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.about-view__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.about-view__spinner {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.about-view__error {
  color: #dc2626;
  padding: 1rem;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
}

.about-view__section {
  margin-bottom: 2.5rem;
}

.about-view__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

.about-view__section-body {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.about-view__contact-list {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.about-view__contact-list dt {
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.about-view__contact-list dd {
  margin: 0;
}

@media (min-width: 768px) {
  .about-view {
    padding: 3rem 2rem;
  }

  .about-view__title {
    font-size: 2rem;
  }

  .about-view__section-title {
    font-size: 1.25rem;
  }

  .about-view__section-body {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .about-view {
    padding: 4rem 2rem;
  }

  .about-view__title {
    font-size: 2.25rem;
    margin-bottom: 3rem;
  }
}
</style>
