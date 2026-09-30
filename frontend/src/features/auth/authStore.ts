import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'ww-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
