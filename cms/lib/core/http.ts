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
