<template>
  <div class="help-center">
    <h1 class="help-center__title">{{ t("helpCenter.title") }}</h1>

    <!-- 產品管理 -->
    <section class="help-center__section">
      <h2 class="help-center__section-title">{{ t("helpCenter.product.title") }}</h2>
      <div class="help-center__steps">
        <p v-for="(line, i) in productSteps" :key="i" class="help-center__step">{{ line }}</p>
      </div>
      <p class="help-center__note">{{ t("helpCenter.product.imageRule") }}</p>
      <div class="help-center__faq">
        <div class="help-center__faq-item">
          <p class="help-center__faq-q">{{ t("helpCenter.product.faq.q1") }}</p>
          <p class="help-center__faq-a">{{ t("helpCenter.product.faq.a1") }}</p>
        </div>
      </div>
    </section>

    <!-- 首頁輪播管理 -->
    <section class="help-center__section">
      <h2 class="help-center__section-title">{{ t("helpCenter.banner.title") }}</h2>
      <div class="help-center__steps">
        <p v-for="(line, i) in bannerSteps" :key="i" class="help-center__step">{{ line }}</p>
      </div>
      <div class="help-center__faq">
        <div class="help-center__faq-item">
          <p class="help-center__faq-q">{{ t("helpCenter.banner.faq.q1") }}</p>
          <p class="help-center__faq-a">{{ t("helpCenter.banner.faq.a1") }}</p>
        </div>
      </div>
    </section>

    <!-- 聯絡人管理 -->
    <section class="help-center__section">
      <h2 class="help-center__section-title">{{ t("helpCenter.contacts.title") }}</h2>
      <div class="help-center__steps">
        <p v-for="(line, i) in contactSteps" :key="i" class="help-center__step">{{ line }}</p>
      </div>
      <p class="help-center__note">{{ t("helpCenter.contacts.transactionNote") }}</p>
      <div class="help-center__faq">
        <div class="help-center__faq-item">
          <p class="help-center__faq-q">{{ t("helpCenter.contacts.faq.q1") }}</p>
          <p class="help-center__faq-a">{{ t("helpCenter.contacts.faq.a1") }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const productSteps = computed(() => t("helpCenter.product.steps").split("\n").filter(Boolean));
const bannerSteps = computed(() => t("helpCenter.banner.steps").split("\n").filter(Boolean));
const contactSteps = computed(() => t("helpCenter.contacts.steps").split("\n").filter(Boolean));
</script>

<style scoped>
.help-center {
  max-width: 800px;
}

.help-center__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2rem;
}

.help-center__section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.help-center__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.help-center__steps {
  margin-bottom: 1rem;
}

.help-center__step {
  font-size: 0.9375rem;
  color: #334155;
  line-height: 1.7;
  margin-bottom: 0.25rem;
}

.help-center__note {
  font-size: 0.875rem;
  color: #64748b;
  background: #f8fafc;
  border-left: 3px solid #0369a1;
  padding: 0.5rem 0.875rem;
  border-radius: 0 4px 4px 0;
  margin-bottom: 1rem;
}

.help-center__faq {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.help-center__faq-item {
  margin-bottom: 0.75rem;
}

.help-center__faq-q {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.help-center__faq-a {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
}
</style>
