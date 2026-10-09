"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/session-store";

/**
 * On first browser open / app mount, ensure an AsterMD visitor sales session
 * exists via BFF POST /api/astermd/session (HttpOnly cookie + create/reuse).
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const ensureSession = useSessionStore((state) => state.ensureSession);
  const refreshJourney = useSessionStore((state) => state.refreshJourney);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    void (async () => {
      const sessionId = await ensureSession();
      if (sessionId) {
        void refreshJourney("Asia/Kolkata");
      }
    })();
  }, [ensureSession, refreshJourney]);

  return children;
}
