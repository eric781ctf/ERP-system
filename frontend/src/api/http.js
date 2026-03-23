import axios from "axios";

const http = axios.create();

// ── Request interceptor: attach access token ──────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401; skip auth endpoints to prevent infinite loops
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/api/v1/auth/login") ||
      originalRequest.url?.includes("/api/v1/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return http(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const res = await axios.post(
        "/api/v1/auth/refresh",
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      const newAccessToken = res.data.data.access_token;
      localStorage.setItem("access_token", newAccessToken);

      // Update store state without creating a circular import
      const { useAuthStore } = await import("../stores/auth.js");
      useAuthStore().accessToken = newAccessToken;

      processQueue(null, newAccessToken);
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      const { useAuthStore } = await import("../stores/auth.js");
      await useAuthStore().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default http;
