import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${API_BASE}/v1/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token = res.data.accessToken as string;
    useAuthStore.getState().setToken(token);
    return token;
  } catch {
    useAuthStore.getState().clear();
    return null;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (!original) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) refreshing = refreshToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  }
);
