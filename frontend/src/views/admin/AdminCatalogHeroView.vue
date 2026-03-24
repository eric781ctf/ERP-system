<script setup>
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCatalogHeroStore } from "../../stores/catalogHero.js";

const { t } = useI18n();
const store = useCatalogHeroStore();

const titleInput = ref("");
const descriptionInput = ref("");
const saving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

let successTimer = null;

onMounted(() => {
  store.fetchHero();
});

watch(
  () => store.hero,
  (hero) => {
    if (hero) {
      titleInput.value = hero.title;
      descriptionInput.value = hero.description;
    }
  },
  { immediate: true }
);

async function handleSave() {
  if (saving.value) return;

  saving.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    await store.updateHero({
      title: titleInput.value,
      description: descriptionInput.value,
    });
    successMessage.value = t("catalogHero.admin.saveSuccess");
    if (successTimer) clearTimeout(successTimer);
    successTimer = setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (e) {
    errorMessage.value =
      e.response?.data?.message || t("catalogHero.admin.saveError");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="catalog-hero-admin">
    <h1 class="catalog-hero-admin__title">{{ t("catalogHero.admin.pageTitle") }}</h1>

    <form class="catalog-hero-admin__form" @submit.prevent="handleSave">
      <div class="catalog-hero-admin__field">
        <label class="catalog-hero-admin__label" for="hero-title">
          {{ t("catalogHero.admin.titleLabel") }}
        </label>
        <input
          id="hero-title"
          v-model="titleInput"
          class="catalog-hero-admin__input"
          type="text"
          :placeholder="t('catalogHero.admin.titlePlaceholder')"
          :disabled="saving"
        />
      </div>

      <div class="catalog-hero-admin__field">
        <label class="catalog-hero-admin__label" for="hero-description">
          {{ t("catalogHero.admin.descriptionLabel") }}
        </label>
        <textarea
          id="hero-description"
          v-model="descriptionInput"
          class="catalog-hero-admin__textarea"
          :placeholder="t('catalogHero.admin.descriptionPlaceholder')"
          :disabled="saving"
          rows="4"
        />
      </div>

      <div v-if="successMessage" class="catalog-hero-admin__alert catalog-hero-admin__alert--success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="catalog-hero-admin__alert catalog-hero-admin__alert--error">
        {{ errorMessage }}
      </div>

      <div class="catalog-hero-admin__actions">
        <button
          type="submit"
          class="btn btn--primary"
          :disabled="saving"
        >
          {{ saving ? t("catalogHero.admin.saving") : t("catalogHero.admin.save") }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.catalog-hero-admin {
  max-width: 720px;
  padding: var(--space-6);
}

.catalog-hero-admin__title {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 var(--space-6);
}

.catalog-hero-admin__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.catalog-hero-admin__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.catalog-hero-admin__label {
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-primary);
}

.catalog-hero-admin__input,
.catalog-hero-admin__textarea {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: var(--radius-base, 4px);
  font-size: var(--font-size-base, 1rem);
  color: var(--color-text-primary);
  background: var(--color-background);
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--transition-base);
}

.catalog-hero-admin__input:focus,
.catalog-hero-admin__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.catalog-hero-admin__input:disabled,
.catalog-hero-admin__textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.catalog-hero-admin__textarea {
  resize: vertical;
  min-height: 100px;
}

.catalog-hero-admin__alert {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-base, 4px);
  font-size: var(--font-size-sm, 0.875rem);
}

.catalog-hero-admin__alert--success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.catalog-hero-admin__alert--error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.catalog-hero-admin__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
