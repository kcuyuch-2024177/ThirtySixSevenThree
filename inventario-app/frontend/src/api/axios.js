import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inventoryApi = axios.create({
  baseURL: import.meta.env.VITE_INVENTORY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const reportsApi = axios.create({
  baseURL: import.meta.env.VITE_REPORTS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function attachAuthToken(config) {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function handleUnauthorized(error) {
  if (error.response?.status === 401) {
    useAuthStore.getState().clearAuth();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }
  return Promise.reject(error);
}

inventoryApi.interceptors.request.use(attachAuthToken);
reportsApi.interceptors.request.use(attachAuthToken);
inventoryApi.interceptors.response.use((response) => response, handleUnauthorized);
reportsApi.interceptors.response.use((response) => response, handleUnauthorized);
authApi.interceptors.response.use((response) => response, (error) => {
  // Solo forzar logout en /auth/me u otras rutas autenticadas, no en login fallido
  if (error.config?.url?.includes('/auth/me') && error.response?.status === 401) {
    return handleUnauthorized(error);
  }
  return Promise.reject(error);
});

export default {
  authApi,
  inventoryApi,
  reportsApi,
};
