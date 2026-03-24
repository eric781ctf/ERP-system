<script setup>
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAboutUsStore } from "../../stores/aboutUs.js";

const { t } = useI18n();
const aboutUsStore = useAboutUsStore();

const activeTab = ref("zh-TW");

const form = ref({
  company_intro_zh: "",
  company_intro_en: "",
  brand_story_zh: "",
  brand_story_en: "",
  contact_info_zh: "",
  contact_info_en: "",
});

const successMessage = ref("");
let successTimer = null;

onMounted(() => {
  aboutUsStore.fetchAboutUs();
});

watch(
  () => aboutUsStore.aboutUs,
  (data) => {
    if (data) {
      form.value.company_intro_zh = data.company_intro_zh ?? "";
      form.value.company_intro_en = data.company_intro_en ?? "";
      form.value.brand_story_zh = data.brand_story_zh ?? "";
      form.value.brand_story_en = data.brand_story_en ?? "";
      form.value.contact_info_zh = data.contact_info_zh ?? "";
      form.value.contact_info_en = data.contact_info_en ?? "";
    }
  },
  { immediate: true }
);

async function handleSave() {
  if (aboutUsStore.saving) return;

  successMessage.value = "";

  await aboutUsStore.updateAboutUs({ ...form.value });

  if (!aboutUsStore.error) {
    successMessage.value = t("aboutUs.admin.saveSuccess");
    if (successTimer) clearTimeout(successTimer);
    successTimer = setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  }
}
</script>

<template>
  <div class="about-us-admin">
    <h1 class="about-us-admin__title">{{ t("aboutUs.admin.title") }}</h1>

    <!-- Tab 切換 -->
    <div class="about-us-admin__tabs" role="tablist">
      <button
        role="tab"
        class="about-us-admin__tab"
        :class="{ 'about-us-admin__tab--active': activeTab === 'zh-TW' }"
        :aria-selected="activeTab === 'zh-TW'"
        @click="activeTab = 'zh-TW'"
      >
        {{ t("aboutUs.admin.tabZhTW") }}
      </button>
      <button
        role="tab"
        class="about-us-admin__tab"
        :class="{ 'about-us-admin__tab--active': activeTab === 'en' }"
        :aria-selected="activeTab === 'en'"
        @click="activeTab = 'en'"
      >
        {{ t("aboutUs.admin.tabEn") }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="aboutUsStore.loading" class="about-us-admin__loading" aria-live="polite">
      <span class="about-us-admin__spinner" aria-hidden="true"></span>
    </div>

    <form v-else class="about-us-admin__form" @submit.prevent="handleSave">
      <!-- 繁體中文 tab -->
      <template v-if="activeTab === 'zh-TW'">
        <div class="about-us-admin__field">
          <label class="about-us-admin__label" for="company-intro-zh">
            {{ t("aboutUs.admin.companyIntro") }}
          </label>
          <textarea
            id="company-intro-zh"
            v-model="form.company_intro_zh"
            class="about-us-admin__textarea"
            :disabled="aboutUsStore.saving"
            rows="6"
          />
        </div>

        <div class="about-us-admin__field">
          <label class="about-us-admin__label" for="brand-story-zh">
            {{ t("aboutUs.admin.brandStory") }}
          </label>
          <textarea
            id="brand-story-zh"
            v-model="form.brand_story_zh"
            class="about-us-admin__textarea"
            :disabled="aboutUsStore.saving"
            rows="6"
          />
        </div>

        <div class="about-us-admin__field">
          <label class="about-us-admin__label" for="contact-info-zh">
            {{ t("aboutUs.admin.contactInfo") }}
          </label>
          <textarea
            id="contact-info-zh"
            v-model="form.contact_info_zh"
            class="about-us-admin__textarea"
            :disabled="aboutUsStore.saving"
            rows="3"
          />
        </div>
      </template>

      <!-- 英文 tab -->
      <template v-else>
        <div class="about-us-admin__field">
          <label class="about-us-admin__label" for="company-intro-en">
            {{ t("aboutUs.admin.companyIntro") }}
          </label>
          <textarea
            id="company-intro-en"
            v-model="form.company_intro_en"
            class="about-us-admin__textarea"
            :disabled="aboutUsStore.saving"
            rows="6"
          />
        </div>

        <div class="about-us-admin__field">
          <label class="about-us-admin__label" for="brand-story-en">
            {{ t("aboutUs.admin.brandStory") }}
          </label>
          <textarea
            id="brand-story-en"
            v-model="form.brand_story_en"
            class="about-us-admin__textarea"
            :disabled="aboutUsStore.saving"
            rows="6"
          />
        </div>

        <div class="about-us-admin__field">
          <label class="about-us-admin__label" for="contact-info-en">
            {{ t("aboutUs.admin.contactInfo") }}
          </label>
          <textarea
            id="contact-info-en"
            v-model="form.contact_info_en"
            class="about-us-admin__textarea"
            :disabled="aboutUsStore.saving"
            rows="3"
          />
        </div>
      </template>

      <!-- 成功訊息 -->
      <div v-if="successMessage" class="about-us-admin__alert about-us-admin__alert--success">
        {{ successMessage }}
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="aboutUsStore.error" class="about-us-admin__alert about-us-admin__alert--error">
        {{ aboutUsStore.error }}
      </div>

      <div class="about-us-admin__actions">
        <button
          type="submit"
          class="btn btn--primary"
          :disabled="aboutUsStore.saving"
        >
          {{ aboutUsStore.saving ? t("aboutUs.admin.savingBtn") : t("aboutUs.admin.saveBtn") }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.about-us-admin {
  max-width: 720px;
  padding: var(--space-6);
}

.about-us-admin__title {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 var(--space-6);
}

.about-us-admin__tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--space-6);
  border-bottom: 2px solid var(--color-border, #e5e7eb);
}

.about-us-admin__tab {
  padding: 0.5rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.about-us-admin__tab:hover {
  color: var(--color-primary);
}

.about-us-admin__tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.about-us-admin__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.about-us-admin__spinner {
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

.about-us-admin__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.about-us-admin__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.about-us-admin__label {
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-primary);
}

.about-us-admin__textarea {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: var(--radius-base, 4px);
  font-size: var(--font-size-base, 1rem);
  color: var(--color-text-primary);
  background: var(--color-background);
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  transition: border-color var(--transition-base);
}

.about-us-admin__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.about-us-admin__textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.about-us-admin__alert {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-base, 4px);
  font-size: var(--font-size-sm, 0.875rem);
}

.about-us-admin__alert--success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.about-us-admin__alert--error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.about-us-admin__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
