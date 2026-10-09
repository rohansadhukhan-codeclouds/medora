"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart line without quantity controls — each product appears at most once.
 */
export type CartItem = {
  id: string;
  name: string;
  image?: string;
  priceCents: number | null;
  priceLabel: string | null;
  href: string;
};

type CartStoreState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  hasItem: (productId: string) => boolean;
};

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((entry) => entry.id === item.id);
        if (existing) return;
        set({ items: [...get().items, item] });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((entry) => entry.id !== productId),
        });
      },

      clearCart: () => set({ items: [] }),

      hasItem: (productId) =>
        get().items.some((entry) => entry.id === productId),
    }),
    {
      name: "medora-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function selectCartCount(state: CartStoreState): number {
  return state.items.length;
}

export function selectCartTotalCents(state: CartStoreState): number | null {
  if (state.items.length === 0) return null;
  let total = 0;
  let hasPrice = false;
  for (const item of state.items) {
    if (typeof item.priceCents === "number") {
      total += item.priceCents;
      hasPrice = true;
    }
  }
  return hasPrice ? total : null;
}
