import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as authApi from "../api/auth.js";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref(localStorage.getItem("access_token") || "");
  const refreshToken = ref(localStorage.getItem("refresh_token") || "");
  const username = ref("");
  const isActive = ref(false);
  const redirectPath = ref("/admin/dashboard");

  const isLoggedIn = computed(() => !!accessToken.value);

  async function login(usernameVal, password) {
    const res = await authApi.login(usernameVal, password);
    const { access_token, refresh_token } = res.data;

    accessToken.value = access_token;
    refreshToken.value = refresh_token;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    await fetchMe();
  }

  async function fetchMe() {
    try {
      const res = await authApi.me();
      username.value = res.data.username;
      isActive.value = res.data.is_active;
    } catch {
      // Non-critical: UI can still function without username
    }
  }

  function clearAuth() {
    accessToken.value = "";
    refreshToken.value = "";
    username.value = "";
    isActive.value = false;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Always clear local state even if API call fails (Req 3.5)
    } finally {
      clearAuth();
      window.location.replace("/login");
    }
  }

  return {
    accessToken,
    refreshToken,
    username,
    isActive,
    redirectPath,
    isLoggedIn,
    login,
    fetchMe,
    logout,
    clearAuth,
  };
});
