import axios from 'axios';
import { useAuthStore } from './auth-store';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  'http://localhost:3001/api';

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Terjadi kesalahan API';

    return Promise.reject(new Error(Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage));
  },
);
