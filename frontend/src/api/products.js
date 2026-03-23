import http from "./http.js";

const BASE = "/api/v1/products";

export const fetchProducts = (params = {}) =>
  http.get(BASE, { params }).then((r) => r.data);

export const fetchProduct = (id) =>
  http.get(`${BASE}/${id}`).then((r) => r.data);

export const createProduct = (payload) =>
  http.post(BASE, payload).then((r) => r.data);

export const updateProduct = (id, payload) =>
  http.put(`${BASE}/${id}`, payload).then((r) => r.data);

export const deleteProduct = (id) =>
  http.delete(`${BASE}/${id}`).then((r) => r.data);

export const togglePublish = (id, isPublished) =>
  http
    .patch(`${BASE}/${id}/publish`, { is_published: isPublished })
    .then((r) => r.data);

export const uploadImage = (id, formData) =>
  http
    .post(`${BASE}/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const deleteImage = (productId, imageId) =>
  http.delete(`${BASE}/${productId}/images/${imageId}`).then((r) => r.data);

export const reorderImages = (productId, order) =>
  http
    .patch(`${BASE}/${productId}/images/reorder`, { order })
    .then((r) => r.data);
