"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSessionStore } from "@/stores/session-store";

export function useVisitorSession() {
  const {
    sessionId,
    status,
    error,
    created,
    events,
    ensureSession,
    refreshJourney,
    clearSessionState,
  } = useSessionStore(
    useShallow((state) => ({
      sessionId: state.sessionId,
      status: state.status,
      error: state.error,
      created: state.created,
      events: state.events,
      ensureSession: state.ensureSession,
      refreshJourney: state.refreshJourney,
      clearSessionState: state.clearSessionState,
    })),
  );

  const refetch = useCallback(() => ensureSession(), [ensureSession]);

  return {
    sessionId,
    status,
    error,
    created,
    events,
    isLoading: status === "loading" || status === "idle",
    isReady: status === "success" && Boolean(sessionId),
    ensureSession,
    refreshJourney,
    refetch,
    clearSessionState,
  };
}
