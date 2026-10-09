"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  selectCartCount,
  selectCartTotalCents,
  useCartStore,
  type CartItem,
} from "@/stores/cart-store";

export function useCart() {
  const { items, addItem, removeItem, clearCart, hasItem } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      addItem: state.addItem,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
      hasItem: state.hasItem,
    })),
  );

  const count = useCartStore(selectCartCount);
  const totalCents = useCartStore(selectCartTotalCents);

  const toggleItem = useCallback(
    (item: CartItem) => {
      if (hasItem(item.id)) {
        removeItem(item.id);
        return;
      }
      addItem(item);
    },
    [addItem, hasItem, removeItem],
  );

  return {
    items,
    count,
    totalCents,
    addItem,
    removeItem,
    clearCart,
    hasItem,
    toggleItem,
    isEmpty: items.length === 0,
  };
}
