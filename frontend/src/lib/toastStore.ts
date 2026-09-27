import { create } from 'zustand';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const duration = t.duration ?? 3500;
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, duration);
    }
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, opts: Partial<Omit<Toast, 'id' | 'title'>> = {}) =>
    useToastStore.getState().push({ title, ...opts }),
  error: (title: string, opts: Partial<Omit<Toast, 'id' | 'title'>> = {}) =>
    useToastStore.getState().push({ title, duration: 5000, ...opts }),
};
