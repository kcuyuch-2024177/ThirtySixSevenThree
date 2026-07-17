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

inventoryApi.interceptors.request.use(attachAuthToken);
reportsApi.interceptors.request.use(attachAuthToken);

export default {
  authApi,
  inventoryApi,
  reportsApi,
};
