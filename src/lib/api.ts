import axios from "axios";

const API_BASE = "http://localhost:5050/api/admin"; // or use import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: API_BASE,
});
