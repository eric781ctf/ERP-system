import axios from "axios";
import http from "./http.js";

const BASE = "/api/v1/auth";

// login uses plain axios (no token needed, avoid interceptor interference)
export const login = (username, password) =>
  axios.post(`${BASE}/login`, { username, password }).then((r) => r.data);

// refresh uses plain axios with manual refresh token header
export const refresh = (refreshToken) =>
  axios
    .post(`${BASE}/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    .then((r) => r.data);

// logout and me use http instance (interceptor auto-attaches access token)
export const logout = () =>
  http.post(`${BASE}/logout`).then((r) => r.data);

export const me = () =>
  http.get(`${BASE}/me`).then((r) => r.data);
