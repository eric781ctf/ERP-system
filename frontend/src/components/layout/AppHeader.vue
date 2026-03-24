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

    <div class="header__brand">{{ t("layout.brand.name") }}</div>

    <div class="header__right">
      <RouterLink to="/" class="header__public-link">
        {{ t("layout.header.viewPublicSite") }}
      </RouterLink>

      <LanguageSwitcher />

      <div ref="adminMenuRef" class="header__user-menu">
        <button
          class="header__user-btn"
          :aria-label="t('layout.header.userMenu')"
          :aria-expanded="isAdminMenuOpen"
          @click="isAdminMenuOpen = !isAdminMenuOpen"
        >
          <span v-if="authStore.username" class="header__username">{{ authStore.username }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <div v-if="isAdminMenuOpen" class="header__dropdown" role="menu">
          <button class="header__dropdown-item header__dropdown-item--danger" role="menuitem" @click="handleLogout">
            {{ t("layout.header.logout") }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
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

const isAdminMenuOpen = ref(false);
const adminMenuRef = ref(null);

function handleLogout() {
  isAdminMenuOpen.value = false;
  authStore.logout();
}

function handleClickOutside(event) {
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target)) {
    isAdminMenuOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));
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

.header__public-link {
  font-size: 0.8125rem;
  color: #94a3b8;
  text-decoration: none;
  padding: 0.3rem 0.625rem;
  border: 1px solid #475569;
  border-radius: 6px;
  white-space: nowrap;
  transition: color 0.15s ease-out, border-color 0.15s ease-out;
}

.header__public-link:hover {
  color: #f8fafc;
  border-color: #94a3b8;
}

.header__user-menu {
  position: relative;
}

.header__user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s ease-out, color 0.15s ease-out;
}

.header__user-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.header__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  min-width: 140px;
  z-index: 50;
  overflow: hidden;
}

.header__dropdown-item {
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: background 0.15s ease-out;
}

.header__dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.header__dropdown-item--danger {
  color: #f87171;
}

.header__dropdown-item--danger:hover {
  background: rgba(220, 38, 38, 0.15);
}
</style>
