"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AsterMdChannelDetail,
  AsterMdChannelProduct,
  ChannelLoadStatus,
} from "@/lib/api/astermd/channel-types";

/** Client catalog cache — matches the 1-day server TTL. */
export const CHANNEL_CLIENT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Stable empty reference — never return a new `[]` from selectors (prevents infinite loops). */
export const EMPTY_CHANNEL_PRODUCTS: AsterMdChannelProduct[] = [];

type ChannelStoreState = {
  channel: AsterMdChannelDetail | null;
  status: ChannelLoadStatus;
  error: string | null;
  lastFetchedAt: string | null;
  /** Epoch ms when the persisted channel snapshot expires */
  expiresAt: number | null;
  setChannel: (channel: AsterMdChannelDetail, expiresAt?: number | null) => void;
  setStatus: (status: ChannelLoadStatus) => void;
  setError: (error: string | null) => void;
  clearChannel: () => void;
  fetchChannel: (options?: {
    force?: boolean;
  }) => Promise<AsterMdChannelDetail | null>;
};

function isClientCacheFresh(
  channel: AsterMdChannelDetail | null,
  expiresAt: number | null,
): boolean {
  return Boolean(channel?._id && expiresAt && Date.now() < expiresAt);
}

export const useChannelStore = create<ChannelStoreState>()(
  persist(
    (set, get) => ({
      channel: null,
      status: "idle",
      error: null,
      lastFetchedAt: null,
      expiresAt: null,

      setChannel: (channel, expiresAt) =>
        set({
          channel,
          status: "success",
          error: null,
          lastFetchedAt: new Date().toISOString(),
          expiresAt:
            expiresAt ?? Date.now() + CHANNEL_CLIENT_CACHE_TTL_MS,
        }),

      setStatus: (status) => set({ status }),

      setError: (error) => set({ error, status: "error" }),

      clearChannel: () =>
        set({
          channel: null,
          status: "idle",
          error: null,
          lastFetchedAt: null,
          expiresAt: null,
        }),

      fetchChannel: async (options) => {
        const { force = false } = options ?? {};
        const current = get();

        if (!force && current.status === "loading") {
          return current.channel;
        }

        if (
          !force &&
          current.status === "success" &&
          isClientCacheFresh(current.channel, current.expiresAt)
        ) {
          return current.channel;
        }

        if (
          !force &&
          current.channel &&
          !isClientCacheFresh(current.channel, current.expiresAt)
        ) {
          set({
            channel: null,
            expiresAt: null,
            lastFetchedAt: null,
          });
        }

        set({ status: "loading", error: null });

        try {
          const url = force
            ? "/api/astermd/channel?force=1"
            : "/api/astermd/channel";
          const response = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            // Never use the browser HTTP cache — only our channel store +
            // server channel-cache hold channel data.
            cache: "no-store",
          });

          const payload = (await response.json()) as {
            data?: AsterMdChannelDetail;
            error?: string;
            message?: string;
            expiresAt?: string | null;
          };

          if (!response.ok || !payload.data?._id) {
            const message =
              payload.error ??
              payload.message ??
              "Unable to load channel details right now.";
            set({ status: "error", error: message });
            return null;
          }

          const expiresAtMs = payload.expiresAt
            ? Date.parse(payload.expiresAt)
            : Date.now() + CHANNEL_CLIENT_CACHE_TTL_MS;

          set({
            channel: payload.data,
            status: "success",
            error: null,
            lastFetchedAt: new Date().toISOString(),
            expiresAt: Number.isNaN(expiresAtMs)
              ? Date.now() + CHANNEL_CLIENT_CACHE_TTL_MS
              : expiresAtMs,
          });

          return payload.data;
        } catch {
          set({
            status: "error",
            error: "Unable to load channel details right now.",
          });
          return null;
        }
      },
    }),
    {
      name: "medora-channel",
      partialize: (state) => ({
        channel: state.channel,
        lastFetchedAt: state.lastFetchedAt,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (isClientCacheFresh(state.channel, state.expiresAt)) {
          state.setStatus("success");
          return;
        }
        if (state.channel) {
          state.clearChannel();
        }
      },
    },
  ),
);

export const selectChannel = (state: ChannelStoreState) => state.channel;
export const selectChannelProducts = (state: ChannelStoreState) =>
  state.channel?.products ?? EMPTY_CHANNEL_PRODUCTS;
export const selectChannelStatus = (state: ChannelStoreState) => state.status;
export const selectChannelError = (state: ChannelStoreState) => state.error;
