import http from "./http.js";

const PUBLIC_URL = "/api/v1/catalog-hero";
const ADMIN_URL = "/api/v1/admin/catalog-hero";

export const getHero = () =>
  http.get(PUBLIC_URL).then((r) => r.data);

export const updateHero = (data) =>
  http.put(ADMIN_URL, data).then((r) => r.data);
