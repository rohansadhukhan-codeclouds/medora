"use client";

import { useEffect, useRef } from "react";
import { useChannelStore } from "@/stores/channel-store";

/**
 * Boots AsterMD channel detail into Zustand once on app load.
 * Token stays server-side; client only receives channel JSON via BFF.
 */
export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const fetchChannel = useChannelStore((state) => state.fetchChannel);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    void fetchChannel();
  }, [fetchChannel]);

  return children;
}
