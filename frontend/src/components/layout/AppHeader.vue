<template>
  <header class="header">
    <button
      class="header__hamburger"
      :aria-label="t('layout.header.toggleMenu')"
      aria-expanded="false"
      @click="props.onToggleSidebar && props.onToggleSidebar()"
    >
      ☰
    </button>

    <div class="header__brand">ERP</div>

    <div class="header__right">
      <span v-if="authStore.username" class="header__username">
        {{ authStore.username }}
      </span>

      <LanguageSwitcher />

      <button class="header__logout" @click="authStore.logout()">
        {{ t("layout.header.logout") }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.js";
import LanguageSwitcher from "../LanguageSwitcher.vue";

const props = defineProps({
  onToggleSidebar: {
    type: Function,
    default: null,
  },
});

const { t } = useI18n();
const authStore = useAuthStore();
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #1e293b;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.25rem;
  z-index: 20;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.header__hamburger {
  background: none;
  border: none;
  color: #f8fafc;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  line-height: 1;
}

.header__hamburger:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (min-width: 1024px) {
  .header__hamburger {
    display: none;
  }

  .header {
    left: 240px;
  }
}

.header__brand {
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: 0.05em;
}

.header__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header__username {
  font-size: 0.875rem;
  color: #94a3b8;
}

.header__logout {
  background: none;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s ease-out, color 0.15s ease-out;
}

.header__logout:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}
</style>
