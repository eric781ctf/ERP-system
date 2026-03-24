<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.js";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const usernameError = ref(false);
const passwordError = ref(false);
const errorKey = ref("");

async function handleLogin() {
  usernameError.value = !username.value.trim();
  passwordError.value = !password.value;
  if (usernameError.value || passwordError.value) return;

  loading.value = true;
  errorKey.value = "";

  try {
    await authStore.login(username.value.trim(), password.value);
    const target = authStore.redirectPath || "/admin/help-center";
    authStore.redirectPath = "/admin/help-center";
    router.push(target);
  } catch (err) {
    if (err.response?.status === 401) {
      errorKey.value = "auth.login.error.invalid";
    } else if (!err.response) {
      errorKey.value = "auth.login.error.network";
    } else {
      errorKey.value = "auth.login.error.unknown";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-topbar">
      <RouterLink to="/" class="login-brand">{{ t("layout.brand.name") }}</RouterLink>
    </div>
    <div class="login-card">
      <h1 class="login-title">{{ t("auth.login.title") }}</h1>

      <form class="login-form" @submit.prevent="handleLogin" novalidate>
        <!-- Username -->
        <div class="form-group">
          <label for="username">{{ t("auth.login.username") }} <span class="required-badge">{{ t("admin.required") }}</span></label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            :class="{ error: usernameError }"
            @input="usernameError = false"
          />
          <span v-if="usernameError" class="field-error">
            {{ t("auth.login.error.required") }}
          </span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">{{ t("auth.login.password") }} <span class="required-badge">{{ t("admin.required") }}</span></label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :class="{ error: passwordError }"
              @input="passwordError = false"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')"
              @click="showPassword = !showPassword"
            >
              <!-- Eye open -->
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <!-- Eye closed -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="passwordError" class="field-error">
            {{ t("auth.login.error.required") }}
          </span>
        </div>

        <!-- API error -->
        <p v-if="errorKey" class="api-error" role="alert">
          {{ t(errorKey) }}
        </p>

        <!-- Submit -->
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? t("auth.login.loading") : t("auth.login.submit") }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f8fafc);
  position: relative;
}

.login-topbar {
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem 1.5rem;
}

.login-brand {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #0f172a;
  text-decoration: none;
  letter-spacing: 0.02em;
}

.login-brand:hover {
  color: #0369a1;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-primary, #0f172a);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary, #0f172a);
}

.required-badge {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.8125rem;
}

.form-group input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus {
  border-color: var(--color-cta, #0369a1);
}

.form-group input.error {
  border-color: #ef4444;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 2.75rem;
}

.toggle-password {
  position: absolute;
  right: 0.625rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #64748b;
  display: flex;
  align-items: center;
}

.toggle-password:hover {
  color: var(--color-primary, #0f172a);
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
}

.api-error {
  font-size: 0.875rem;
  color: #ef4444;
  text-align: center;
  margin: 0;
}

.submit-btn {
  padding: 0.75rem;
  background: var(--color-cta, #0369a1);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
