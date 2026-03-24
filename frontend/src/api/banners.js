import http from "./http.js";

const BASE = "/api/v1/banners";

export const fetchBanners = () =>
  http.get(BASE).then((r) => r.data);

export const createBanner = (formData) =>
  http
    .post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const updateBanner = (id, payload) =>
  http.put(`${BASE}/${id}`, payload).then((r) => r.data);

export const deleteBanner = (id) =>
  http.delete(`${BASE}/${id}`).then((r) => r.data);

export const reorderBanners = (orderedIds) =>
  http.patch(`${BASE}/reorder`, { order: orderedIds }).then((r) => r.data);

export const toggleActive = (id, isActive) =>
  http
    .patch(`${BASE}/${id}/toggle`, { is_active: isActive })
    .then((r) => r.data);
