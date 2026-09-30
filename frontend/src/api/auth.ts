import { apiClient } from './client';
import type { User } from '@/features/auth/authStore';

export const authApi = {
  async me(): Promise<User> {
    const res = await apiClient.get<User>('/v1/auth/me');
    return res.data;
  },
  async logout(): Promise<void> {
    await apiClient.post('/v1/auth/logout');
  },
};
