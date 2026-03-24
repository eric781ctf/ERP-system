<template>
  <nav class="public-navbar" aria-label="主導覽列">
    <div class="public-navbar__inner">
      <div class="public-navbar__brand">ERP</div>

      <ul class="public-navbar__links">
        <li>
          <RouterLink to="/" class="public-navbar__link" exact-active-class="public-navbar__link--active">
            {{ t("layout.nav.home") }}
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/products" class="public-navbar__link" active-class="public-navbar__link--active">
            {{ t("layout.nav.catalog") }}
          </RouterLink>
        </li>
      </ul>

      <div class="public-navbar__right">
        <LanguageSwitcher />
        <RouterLink :to="staffLoginTo" class="public-navbar__staff-login">
          {{ t("layout.nav.staffLogin") }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.js";
import LanguageSwitcher from "../LanguageSwitcher.vue";

const { t } = useI18n();
const authStore = useAuthStore();

const staffLoginTo = computed(() =>
  authStore.isLoggedIn ? "/admin/dashboard" : "/login"
);
</script>

<style scoped>
.public-navbar {
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  z-index: 10;
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
  font-size: 1.125rem;
  color: #0f172a;
  letter-spacing: 0.05em;
  flex-shrink: 0;
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
  color: #475569;
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 6px;
  white-space: nowrap;
  transition: color 0.15s ease-out, background 0.15s ease-out;
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
  color: #0f172a;
  background: #f1f5f9;
}

.public-navbar__link--active {
  color: #0369a1;
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
  border: 1px solid #0369a1;
  border-radius: 6px;
  color: #0369a1;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s ease-out, color 0.15s ease-out;
}

.public-navbar__staff-login:hover {
  background: #0369a1;
  color: #fff;
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
</style>
