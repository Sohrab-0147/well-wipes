import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
}

interface RecentState {
  items: RecentProduct[];
  push: (item: RecentProduct) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      push: (item) =>
        set((s) => ({
          items: [item, ...s.items.filter((p) => p.id !== item.id)].slice(0, 6),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'ww-recently-viewed' }
  )
);
