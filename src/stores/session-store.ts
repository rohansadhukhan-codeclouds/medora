"use client";

import { create } from "zustand";
import type { AsterMdSessionJourneyEvent } from "@/lib/api/astermd/session-types";

export type VisitorSessionStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

type SessionStoreState = {
  sessionId: string | null;
  status: VisitorSessionStatus;
  error: string | null;
  created: boolean | null;
  events: AsterMdSessionJourneyEvent[];
  ensureSession: () => Promise<string | null>;
  refreshJourney: (tz?: string) => Promise<void>;
  clearSessionState: () => void;
};

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  sessionId: null,
  status: "idle",
  error: null,
  created: null,
  events: [],

  ensureSession: async () => {
    const current = get();
    if (current.status === "loading") {
      return current.sessionId;
    }
    if (current.status === "success" && current.sessionId) {
      return current.sessionId;
    }

    set({ status: "loading", error: null });

    try {
      const response = await fetch("/api/astermd/session", {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        sessionId?: string;
        created?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.sessionId) {
        const message =
          payload.error ?? "Unable to start browsing session right now.";
        set({ status: "error", error: message, sessionId: null });
        return null;
      }

      set({
        sessionId: payload.sessionId,
        created: Boolean(payload.created),
        status: "success",
        error: null,
      });

      return payload.sessionId;
    } catch {
      set({
        status: "error",
        error: "Unable to start browsing session right now.",
        sessionId: null,
      });
      return null;
    }
  },

  refreshJourney: async (tz = "Asia/Kolkata") => {
    const sessionId = get().sessionId;
    if (!sessionId) return;

    try {
      const params = new URLSearchParams({ tz });
      const response = await fetch(`/api/astermd/session?${params}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        events?: AsterMdSessionJourneyEvent[];
        error?: string;
      };

      if (!response.ok) {
        console.warn("[session] journey refresh failed", payload.error);
        return;
      }

      set({ events: payload.events ?? [] });
    } catch (error) {
      console.warn("[session] journey refresh failed", error);
    }
  },

  clearSessionState: () =>
    set({
      sessionId: null,
      status: "idle",
      error: null,
      created: null,
      events: [],
    }),
}));
