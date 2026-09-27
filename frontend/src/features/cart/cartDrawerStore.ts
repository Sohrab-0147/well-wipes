import { create } from 'zustand';

interface CartDrawerState {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggle: () => void;
}

export const useCartDrawerStore = create<CartDrawerState>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
