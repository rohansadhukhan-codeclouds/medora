"use client";

import { useEffect } from "react";
import { useChannelStore } from "@/stores/channel-store";

/**
 * Boots AsterMD channel detail into Zustand after persist rehydration.
 * Fresh 1-day client cache → no network call.
 * Expired / missing → BFF (`/api/astermd/channel`), which itself caches
 * the AsterMD response for 1 day.
 */
export function ChannelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const boot = () => {
      const state = useChannelStore.getState();
      const fresh =
        Boolean(state.channel?._id) &&
        typeof state.expiresAt === "number" &&
        Date.now() < state.expiresAt;

      if (fresh) {
        if (state.status !== "success") {
          state.setStatus("success");
        }
        return;
      }

      void state.fetchChannel();
    };

    const persistApi = useChannelStore.persist;
    if (persistApi.hasHydrated()) {
      boot();
      return;
    }

    return persistApi.onFinishHydration(() => {
      boot();
    });
  }, []);

  return children;
}
