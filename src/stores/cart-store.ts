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

type RemoteCartLine = {
  product_id?: string;
  name?: string;
  qty?: number;
};

/** Map AsterMD view lines onto CartItem, keeping local image/price when ids match. */
function mapRemoteItemsToCart(
  remoteItems: RemoteCartLine[],
  existing: CartItem[],
): CartItem[] {
  const byId = new Map(existing.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const next: CartItem[] = [];

  for (const line of remoteItems) {
    const id = String(line.product_id ?? "").trim();
    const name = String(line.name ?? "").trim();
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);

    const prev = byId.get(id);
    next.push({
      id,
      name,
      image: prev?.image,
      priceCents: prev?.priceCents ?? null,
      priceLabel: prev?.priceLabel ?? null,
      href: prev?.href ?? `/catalog/${encodeURIComponent(id)}`,
    });
  }

  return next;
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

/** Dedupes Strict Mode / double-mount view fetches in development. */
let refreshInFlight: Promise<void> | null = null;

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
        set({ syncStatus: "syncing", syncError: null });
        try {
          // Empty list is intentional (clear / remove last item) → PUT update.
          const result = await postCartSync(items);
          if (!result.ok) {
            set({
              syncStatus: "error",
              syncError: result.error ?? "Unable to sync cart.",
            });
            return false;
          }
          set({
            syncStatus: items.length > 0 ? "synced" : "idle",
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
        if (refreshInFlight) {
          await refreshInFlight;
          return;
        }

        refreshInFlight = (async () => {
          set({ syncStatus: "syncing", syncError: null });
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
              error?: string;
              data?: {
                _id?: string;
                items?: RemoteCartLine[];
              } | null;
            };

            if (!response.ok || !payload.ok) {
              set({
                syncStatus: "error",
                syncError:
                  payload.error ?? "Unable to load cart from care partner.",
              });
              return;
            }

            // No remote cart yet — clear local so the page matches AsterMD view.
            if (!payload.data) {
              set({
                items: [],
                remoteCartId: null,
                syncStatus: "idle",
                syncError: null,
              });
              return;
            }

            const items = mapRemoteItemsToCart(
              Array.isArray(payload.data.items) ? payload.data.items : [],
              get().items,
            );

            set({
              items,
              remoteCartId: payload.data._id ?? null,
              syncStatus: items.length > 0 ? "synced" : "idle",
              syncError: null,
            });
          } catch {
            set({
              syncStatus: "error",
              syncError: "Unable to load cart from care partner.",
            });
          }
        })().finally(() => {
          refreshInFlight = null;
        });

        await refreshInFlight;
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
        await get().syncToAsterMd();
      },

      clearCart: async () => {
        set({ items: [], syncError: null });
        await get().syncToAsterMd();
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
