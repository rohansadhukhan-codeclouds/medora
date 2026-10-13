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
  /** Shared in-flight ensure so concurrent callers wait on one POST. */
  ensurePromise: Promise<string | null> | null;
  ensureSession: (options?: { force?: boolean }) => Promise<string | null>;
  refreshJourney: (tz?: string) => Promise<void>;
  clearSessionState: () => void;
};

const MAX_ENSURE_ATTEMPTS = 3;
const RETRY_DELAY_MS = 600;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function requestEnsureSession(): Promise<{
  sessionId: string;
  created: boolean;
}> {
  let lastError = "Unable to start browsing session right now.";

  for (let attempt = 1; attempt <= MAX_ENSURE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        sessionId?: string;
        created?: boolean;
        error?: string;
      };

      if (response.ok && payload.sessionId) {
        return {
          sessionId: payload.sessionId,
          created: Boolean(payload.created),
        };
      }

      lastError =
        payload.error ?? "Unable to start browsing session right now.";
    } catch {
      lastError = "Unable to start browsing session right now.";
    }

    if (attempt < MAX_ENSURE_ATTEMPTS) {
      await wait(RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error(lastError);
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  sessionId: null,
  status: "idle",
  error: null,
  created: null,
  events: [],
  ensurePromise: null,

  ensureSession: async (options) => {
    const force = options?.force ?? false;
    const current = get();

    if (!force && current.status === "success" && current.sessionId) {
      return current.sessionId;
    }

    if (!force && current.ensurePromise) {
      return current.ensurePromise;
    }

    const promise = (async () => {
      set({ status: "loading", error: null });

      try {
        const result = await requestEnsureSession();
        set({
          sessionId: result.sessionId,
          created: result.created,
          status: "success",
          error: null,
          ensurePromise: null,
        });
        return result.sessionId;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to start browsing session right now.";
        set({
          status: "error",
          error: message,
          sessionId: null,
          created: null,
          ensurePromise: null,
        });
        return null;
      }
    })();

    set({ ensurePromise: promise });
    return promise;
  },

  refreshJourney: async (tz = "Asia/Kolkata") => {
    const sessionId = get().sessionId;
    if (!sessionId) return;

    try {
      const params = new URLSearchParams({ tz });
      const response = await fetch(`/api/session?${params}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin",
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
      ensurePromise: null,
    }),
}));
