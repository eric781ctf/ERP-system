import http from "./http.js";

export const fetchAboutUs = () =>
  http.get("/api/v1/about-us").then((r) => r.data);

export const updateAboutUs = (payload) =>
  http.put("/api/v1/admin/about-us", payload).then((r) => r.data);
