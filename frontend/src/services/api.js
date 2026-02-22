// src/services/api.js

import axios from "axios";

/* =========================================================
   CREATE AXIOS INSTANCE
========================================================= */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: false,
});

/* =========================================================
   REQUEST INTERCEPTOR
   - Attach JWT token automatically
========================================================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
   - Handle global errors
   - Auto logout on 401
========================================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error or server not reachable");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 🔐 Auto logout if token expired
    if (status === 401) {
      console.warn("Unauthorized - Redirecting to login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Optional: log other errors
    console.error("API ERROR:", error.response.data);

    return Promise.reject(error);
  }
);

export default api;