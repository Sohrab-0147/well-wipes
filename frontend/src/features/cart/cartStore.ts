import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/lib/toastStore';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  unitPriceCents: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalCents: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
        toast.success('Added to cart', {
          description: `${item.name} · Qty ${quantity}`,
          action: { label: 'View cart', onClick: () => { window.location.href = '/cart'; } },
        });
      },
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalCents: () =>
        get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
      itemCount: () =>
        get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: 'ww-cart' }
  )
);
