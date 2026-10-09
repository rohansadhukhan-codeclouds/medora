"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  EMPTY_CHANNEL_PRODUCTS,
  useChannelStore,
} from "@/stores/channel-store";

/**
 * Global access to AsterMD channel detail stored in Zustand.
 * Use shallow snapshot + stable empty products to avoid SSR infinite loops.
 */
export function useChannel() {
  const {
    channel,
    status,
    error,
    lastFetchedAt,
    expiresAt,
    fetchChannel,
    clearChannel,
  } = useChannelStore(
    useShallow((state) => ({
      channel: state.channel,
      status: state.status,
      error: state.error,
      lastFetchedAt: state.lastFetchedAt,
      expiresAt: state.expiresAt,
      fetchChannel: state.fetchChannel,
      clearChannel: state.clearChannel,
    })),
  );

  const products = channel?.products ?? EMPTY_CHANNEL_PRODUCTS;
  const cacheFresh =
    Boolean(channel?._id) &&
    typeof expiresAt === "number" &&
    Date.now() < expiresAt;

  const refetch = useCallback(
    () => fetchChannel({ force: true }),
    [fetchChannel],
  );

  return {
    channel,
    products,
    status,
    error,
    lastFetchedAt,
    expiresAt,
    cacheFresh,
    isLoading:
      (status === "loading" || status === "idle") && !cacheFresh,
    isReady: status === "success" && Boolean(channel),
    refetch,
    clearChannel,
  };
}
