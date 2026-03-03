import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ── Request interceptor ────────────────────────────────────────────────────
// Automatically attaches the JWT to every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Only attach if it's a real token — not null/undefined stored as strings
    if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────
// On 401, clear stale credentials and redirect to login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;