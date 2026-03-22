import axios from "axios";

export const fetchTags = () =>
  axios.get("/api/v1/tags").then((r) => r.data);
