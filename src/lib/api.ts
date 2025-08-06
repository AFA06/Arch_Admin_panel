// admin/lib/api.ts
import axios from "axios";

const API_BASE = "http://localhost:5050/api/admin";

export const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
