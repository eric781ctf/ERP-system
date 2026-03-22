import axios from "axios";

const BASE = "/api/v1/products";

export const fetchProducts = (params = {}) =>
  axios.get(BASE, { params }).then((r) => r.data);

export const fetchProduct = (id) =>
  axios.get(`${BASE}/${id}`).then((r) => r.data);

export const createProduct = (payload) =>
  axios.post(BASE, payload).then((r) => r.data);

export const updateProduct = (id, payload) =>
  axios.put(`${BASE}/${id}`, payload).then((r) => r.data);

export const deleteProduct = (id) =>
  axios.delete(`${BASE}/${id}`).then((r) => r.data);

export const togglePublish = (id, isPublished) =>
  axios
    .patch(`${BASE}/${id}/publish`, { is_published: isPublished })
    .then((r) => r.data);

export const uploadImage = (id, formData) =>
  axios
    .post(`${BASE}/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const deleteImage = (productId, imageId) =>
  axios.delete(`${BASE}/${productId}/images/${imageId}`).then((r) => r.data);

export const reorderImages = (productId, order) =>
  axios
    .patch(`${BASE}/${productId}/images/reorder`, { order })
    .then((r) => r.data);
