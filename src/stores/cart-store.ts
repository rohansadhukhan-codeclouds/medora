"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSessionStore } from "@/stores/session-store";

/**
 * Cart line without quantity controls — each product appears at most once (qty=1).
 */
export type CartItem = {
  id: string;
  name: string;
  image?: string;
  priceCents: number | null;
  priceLabel: string | null;
  href: string;
};

export type CartSyncStatus = "idle" | "syncing" | "synced" | "error";

type CartStoreState = {
  items: CartItem[];
  /** AsterMD cart document _id when known */
  remoteCartId: string | null;
  syncStatus: CartSyncStatus;
  syncError: string | null;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  hasItem: (productId: string) => boolean;
  syncToAsterMd: () => Promise<boolean>;
  refreshFromAsterMd: () => Promise<void>;
};

function toAsterMdItems(items: CartItem[]) {
  return items.map((item) => ({
    product_id: item.id,
    name: item.name,
    qty: 1,
  }));
}

async function ensureSessionId(): Promise<string | null> {
  return useSessionStore.getState().ensureSession();
}

async function postCartSync(items: CartItem[]): Promise<{
  ok: boolean;
  cartId?: string | null;
  error?: string;
}> {
  const sessionId = await ensureSessionId();
  if (!sessionId) {
    return { ok: false, error: "Session is required before syncing the cart." };
  }

  const response = await fetch("/api/astermd/cart", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "same-origin",
    body: JSON.stringify({ items: toAsterMdItems(items) }),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    cartId?: string | null;
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      error: payload.error ?? "Unable to sync cart with care partner.",
    };
  }

  return { ok: true, cartId: payload.cartId ?? null };
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      remoteCartId: null,
      syncStatus: "idle",
      syncError: null,

      hasItem: (productId) =>
        get().items.some((entry) => entry.id === productId),

      syncToAsterMd: async () => {
        const items = get().items;
        if (items.length === 0) {
          set({ syncStatus: "idle", syncError: null });
          return true;
        }

        set({ syncStatus: "syncing", syncError: null });
        try {
          const result = await postCartSync(items);
          if (!result.ok) {
            set({
              syncStatus: "error",
              syncError: result.error ?? "Unable to sync cart.",
            });
            return false;
          }
          set({
            syncStatus: "synced",
            syncError: null,
            remoteCartId: result.cartId ?? get().remoteCartId,
          });
          return true;
        } catch {
          set({
            syncStatus: "error",
            syncError: "Unable to sync cart with care partner.",
          });
          return false;
        }
      },

      refreshFromAsterMd: async () => {
        try {
          await ensureSessionId();
          const response = await fetch("/api/astermd/cart", {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            credentials: "same-origin",
          });
          const payload = (await response.json()) as {
            ok?: boolean;
            data?: {
              _id?: string;
              items?: Array<{ product_id?: string; name?: string; qty?: number }>;
            } | null;
          };

          if (!response.ok || !payload.ok || !payload.data) {
            return;
          }

          set({
            remoteCartId: payload.data._id ?? null,
            syncStatus: "synced",
            syncError: null,
          });
        } catch {
          // View is optional — keep local cart.
        }
      },

      addItem: async (item) => {
        const existing = get().items.find((entry) => entry.id === item.id);
        if (existing) return;

        const next = [...get().items, item];
        set({ items: next });
        await get().syncToAsterMd();
      },

      removeItem: async (productId) => {
        const next = get().items.filter((entry) => entry.id !== productId);
        set({ items: next });

        if (next.length === 0) {
          set({ syncStatus: "idle", syncError: null });
          return;
        }

        await get().syncToAsterMd();
      },

      clearCart: async () => {
        set({
          items: [],
          syncStatus: "idle",
          syncError: null,
        });
      },
    }),
    {
      name: "medora-cart",
      partialize: (state) => ({
        items: state.items,
        remoteCartId: state.remoteCartId,
      }),
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
