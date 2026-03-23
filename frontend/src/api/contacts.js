import http from "./http.js";

const BASE = "/api/v1/contacts";

export const getContacts = (params = {}) =>
  http.get(BASE, { params }).then((r) => r.data);

export const createContact = (payload) =>
  http.post(BASE, payload).then((r) => r.data);

export const updateContact = (id, payload) =>
  http.put(`${BASE}/${id}`, payload).then((r) => r.data);

export const deleteContact = (id) =>
  http.delete(`${BASE}/${id}`).then((r) => r.data);
