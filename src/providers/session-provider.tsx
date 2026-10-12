"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSessionStore } from "@/stores/session-store";

/**
 * Mandatory visitor session on every page open/navigation:
 * - No cookie / not ready → create via BFF
 * - Cookie already exists → reuse
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ensureSession = useSessionStore((state) => state.ensureSession);
  const refreshJourney = useSessionStore((state) => state.refreshJourney);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const id = await ensureSession();
      if (!cancelled && id) {
        void refreshJourney("Asia/Kolkata");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, ensureSession, refreshJourney]);

  return children;
}
