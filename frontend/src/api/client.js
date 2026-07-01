import axios from "axios";

const base = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL: `${base}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("dr_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("dr_token");
      localStorage.removeItem("dr_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
