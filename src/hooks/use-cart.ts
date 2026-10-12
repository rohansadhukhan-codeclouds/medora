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
  const {
    items,
    addItem,
    removeItem,
    clearCart,
    hasItem,
    syncStatus,
    syncError,
    remoteCartId,
    syncToAsterMd,
    refreshFromAsterMd,
  } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      addItem: state.addItem,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
      hasItem: state.hasItem,
      syncStatus: state.syncStatus,
      syncError: state.syncError,
      remoteCartId: state.remoteCartId,
      syncToAsterMd: state.syncToAsterMd,
      refreshFromAsterMd: state.refreshFromAsterMd,
    })),
  );

  const count = useCartStore(selectCartCount);
  const totalCents = useCartStore(selectCartTotalCents);

  const toggleItem = useCallback(
    async (item: CartItem) => {
      if (hasItem(item.id)) {
        await removeItem(item.id);
        return;
      }
      await addItem(item);
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
    syncStatus,
    syncError,
    remoteCartId,
    syncToAsterMd,
    refreshFromAsterMd,
    isSyncing: syncStatus === "syncing",
    isEmpty: items.length === 0,
  };
}
