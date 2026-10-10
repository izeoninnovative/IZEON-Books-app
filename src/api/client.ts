import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("izeon_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("izeon_token");
      localStorage.removeItem("izeon_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
