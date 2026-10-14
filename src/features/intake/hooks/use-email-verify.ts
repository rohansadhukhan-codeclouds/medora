"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEBOUNCE_MS = 600;

export type EmailVerifyUiStatus =
  | "idle"
  | "typing"
  | "checking"
  | "valid"
  | "invalid"
  | "unknown"
  | "failed";

type ApiPayload = {
  ok?: boolean;
  result?: string;
  message?: string;
  error?: string;
};

export type UseEmailVerifyState = {
  status: EmailVerifyUiStatus;
  message: string | null;
  isVerified: boolean;
};

/**
 * Debounced client verify against BFF GET /api/email-verify?email=
 */
export function useEmailVerify(email: string): UseEmailVerifyState {
  const [status, setStatus] = useState<EmailVerifyUiStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const requestId = useRef(0);
  const lastValidEmail = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus("idle");
      setMessage(null);
      return;
    }

    if (!EMAIL_RE.test(trimmed)) {
      setStatus("typing");
      setMessage(null);
      return;
    }

    if (lastValidEmail.current === trimmed) {
      setStatus("valid");
      setMessage(null);
      return;
    }

    setStatus("typing");
    setMessage(null);

    const timer = window.setTimeout(() => {
      const id = ++requestId.current;
      setStatus("checking");

      void (async () => {
        try {
          const response = await fetch(
            `/api/email-verify?email=${encodeURIComponent(trimmed)}`,
            { method: "GET", cache: "no-store", credentials: "same-origin" },
          );
          const payload = (await response.json()) as ApiPayload;
          if (id !== requestId.current) return;

          if (!response.ok && !payload.result) {
            setStatus("failed");
            setMessage(payload.error || "Could not verify email.");
            return;
          }

          const result = (payload.result || "").toLowerCase();
          if (payload.ok && result === "valid") {
            setStatus("valid");
            setMessage(null);
            lastValidEmail.current = trimmed;
            return;
          }

          if (result === "unknown") {
            setStatus("unknown");
            setMessage("Could not confirm this email. Try again shortly.");
            return;
          }

          setStatus(result === "invalid" ? "invalid" : "failed");
          setMessage("Invalid email");
        } catch {
          if (id !== requestId.current) return;
          setStatus("failed");
          setMessage("Could not verify email. Please try again.");
        }
      })();
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [email]);

  return {
    status,
    message,
    isVerified: status === "valid",
  };
}
