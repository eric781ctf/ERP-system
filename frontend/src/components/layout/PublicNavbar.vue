<template>
  <nav class="public-navbar" aria-label="主導覽列">
    <div class="public-navbar__inner">
      <RouterLink to="/" class="public-navbar__brand">{{ t("layout.brand.name") }}</RouterLink>

      <ul class="public-navbar__links">
        <li>
          <RouterLink to="/products" class="public-navbar__link" active-class="public-navbar__link--active">
            {{ t("layout.nav.catalog") }}
          </RouterLink>
        </li>
      </ul>

      <div class="public-navbar__right">
        <LanguageSwitcher />

        <!-- 未登入：顯示員工登入 -->
        <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="public-navbar__staff-login">
          {{ t("layout.nav.staffLogin") }}
        </RouterLink>

        <!-- 已登入：顯示人物圖示與下拉選單 -->
        <div v-else ref="userMenuRef" class="public-navbar__user-menu">
          <button
            class="public-navbar__avatar-btn"
            :aria-label="t('layout.nav.userMenu')"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
              <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <div v-if="isOpen" class="public-navbar__dropdown" role="menu">
            <button class="public-navbar__dropdown-item" role="menuitem" @click="goToAdmin">
              {{ t("layout.nav.adminCenter") }}
            </button>
            <button class="public-navbar__dropdown-item public-navbar__dropdown-item--danger" role="menuitem" @click="handleLogout">
              {{ t("layout.nav.logout") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.js";
import LanguageSwitcher from "../LanguageSwitcher.vue";

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const isOpen = ref(false);
const userMenuRef = ref(null);

function goToAdmin() {
  isOpen.value = false;
  router.push("/admin/dashboard");
}

function handleLogout() {
  isOpen.value = false;
  authStore.clearAuth();
  router.push("/");
}

function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
.public-navbar {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: var(--z-navbar);
}

.public-navbar__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.public-navbar__brand {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--color-primary);
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.public-navbar__brand:hover {
  color: var(--color-cta);
}

@media (min-width: 640px) {
  .public-navbar__brand {
    font-size: 1.0625rem;
    max-width: 280px;
  }
}

@media (min-width: 1024px) {
  .public-navbar__brand {
    max-width: none;
    white-space: nowrap;
  }
}

.public-navbar__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0.125rem;
  flex-shrink: 0;
}

.public-navbar__link {
  display: block;
  padding: 0.375rem 0.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 6px;
  white-space: nowrap;
  transition: color var(--transition-fast), background var(--transition-fast);
}

@media (min-width: 640px) {
  .public-navbar__inner {
    padding: 0 1.5rem;
    height: 64px;
    gap: 2rem;
  }

  .public-navbar__links {
    gap: 0.25rem;
  }

  .public-navbar__link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9375rem;
  }
}

.public-navbar__link:hover {
  color: var(--color-primary);
  background: var(--color-background-warm);
  text-decoration: underline;
  text-decoration-color: var(--color-cta);
}

.public-navbar__link--active {
  color: var(--color-cta);
  font-weight: 600;
}

.public-navbar__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.public-navbar__staff-login {
  padding: 0.35rem 0.625rem;
  border: 1px solid var(--color-cta);
  border-radius: 6px;
  color: var(--color-cta);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.public-navbar__staff-login:hover {
  background: var(--color-cta);
  color: var(--color-text-primary);
}

@media (min-width: 640px) {
  .public-navbar__right {
    gap: 1rem;
  }

  .public-navbar__staff-login {
    padding: 0.4rem 0.875rem;
    font-size: 0.875rem;
  }
}

.public-navbar__user-menu {
  position: relative;
}

.public-navbar__avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  transition: color var(--transition-fast), background var(--transition-fast);
}

.public-navbar__avatar-btn:hover {
  color: var(--color-primary);
  background: var(--color-background-warm);
}

.public-navbar__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 50;
  overflow: hidden;
}

.public-navbar__dropdown-item {
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.public-navbar__dropdown-item:hover {
  background: var(--color-background-warm);
}

.public-navbar__dropdown-item--danger {
  color: #dc2626;
}

.public-navbar__dropdown-item--danger:hover {
  background: #fef2f2;
}
</style>
