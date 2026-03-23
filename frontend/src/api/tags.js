import http from "./http.js";

export const fetchTags = () =>
  http.get("/api/v1/tags").then((r) => r.data);
