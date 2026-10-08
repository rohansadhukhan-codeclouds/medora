"use client";

import { create } from "zustand";
import type {
  AsterMdChannelDetail,
  AsterMdChannelProduct,
  ChannelLoadStatus,
} from "@/lib/api/astermd/channel-types";

/** Stable empty reference — never return a new `[]` from selectors (prevents infinite loops). */
export const EMPTY_CHANNEL_PRODUCTS: AsterMdChannelProduct[] = [];

type ChannelStoreState = {
  channel: AsterMdChannelDetail | null;
  status: ChannelLoadStatus;
  error: string | null;
  lastFetchedAt: string | null;
  setChannel: (channel: AsterMdChannelDetail) => void;
  setStatus: (status: ChannelLoadStatus) => void;
  setError: (error: string | null) => void;
  clearChannel: () => void;
  fetchChannel: (options?: {
    force?: boolean;
  }) => Promise<AsterMdChannelDetail | null>;
};

export const useChannelStore = create<ChannelStoreState>((set, get) => ({
  channel: null,
  status: "idle",
  error: null,
  lastFetchedAt: null,

  setChannel: (channel) =>
    set({
      channel,
      status: "success",
      error: null,
      lastFetchedAt: new Date().toISOString(),
    }),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error, status: "error" }),

  clearChannel: () =>
    set({
      channel: null,
      status: "idle",
      error: null,
      lastFetchedAt: null,
    }),

  fetchChannel: async (options) => {
    const { force = false } = options ?? {};
    const current = get();

    if (!force && current.status === "loading") {
      return current.channel;
    }

    if (!force && current.channel && current.status === "success") {
      return current.channel;
    }

    set({ status: "loading", error: null });

    try {
      const response = await fetch("/api/astermd/channel", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        data?: AsterMdChannelDetail;
        error?: string;
        message?: string;
      };

      if (!response.ok || !payload.data?._id) {
        const message =
          payload.error ??
          payload.message ??
          "Unable to load channel details right now.";
        set({ status: "error", error: message });
        return null;
      }

      set({
        channel: payload.data,
        status: "success",
        error: null,
        lastFetchedAt: new Date().toISOString(),
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
}));

export const selectChannel = (state: ChannelStoreState) => state.channel;
export const selectChannelProducts = (state: ChannelStoreState) =>
  state.channel?.products ?? EMPTY_CHANNEL_PRODUCTS;
export const selectChannelStatus = (state: ChannelStoreState) => state.status;
export const selectChannelError = (state: ChannelStoreState) => state.error;
