<template>
  <div class="dashboard">
    <h1 class="dashboard__title">{{ t("layout.dashboard.title") }}</h1>
    <p class="dashboard__welcome">
      {{ t("layout.dashboard.welcome") }}
      <span v-if="authStore.username">, {{ authStore.username }}</span>
    </p>

    <div class="dashboard__grid">
      <div v-for="card in cards" :key="card.to" class="dashboard__card">
        <h2 class="dashboard__card-title">{{ t(card.titleKey) }}</h2>
        <p class="dashboard__card-desc">{{ t(card.descKey) }}</p>
        <RouterLink :to="card.to" class="dashboard__card-btn">
          {{ t(card.btnKey) }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.js";

const { t } = useI18n();
const authStore = useAuthStore();

const cards = [
  {
    to: "/admin/products",
    titleKey: "layout.dashboard.products.title",
    descKey: "layout.dashboard.products.description",
    btnKey: "layout.dashboard.products.enter",
  },
  {
    to: "/admin/contacts",
    titleKey: "layout.dashboard.contacts.title",
    descKey: "layout.dashboard.contacts.description",
    btnKey: "layout.dashboard.contacts.enter",
  },
];
</script>

<style scoped>
.dashboard {
  max-width: 900px;
}

.dashboard__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.dashboard__welcome {
  color: #475569;
  margin: 0 0 2rem;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.dashboard__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.dashboard__card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.dashboard__card-desc {
  color: #475569;
  font-size: 0.9375rem;
  margin: 0 0 0.75rem;
  flex: 1;
}

.dashboard__card-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #0369a1;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  align-self: flex-start;
  transition: background 0.15s ease-out;
}

.dashboard__card-btn:hover {
  background: #0284c7;
}
</style>
