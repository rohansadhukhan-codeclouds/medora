import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailVerifyResultCode =
  | "valid"
  | "invalid"
  | "unknown"
  | "failed";

export type AsterMdEmailVerifyData = {
  result?: string;
  reason?: string;
  code?: string;
};

export type AsterMdEmailVerifyApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdEmailVerifyData | null;
  meta?: unknown;
  error?: Array<{ message?: string; field?: string }> | string | null;
  request_id?: string;
};

export type EmailVerifyOutcome = {
  ok: boolean;
  result: EmailVerifyResultCode;
  reason?: string;
  message: string;
  /** True when AsterMD returned a cached Debounce hit (we cannot know for sure — informational). */
  source: "live" | "mock";
};

function normalizeResult(raw: string | undefined): EmailVerifyResultCode {
  const value = (raw || "").toLowerCase().trim();
  if (value === "valid") return "valid";
  if (value === "unknown") return "unknown";
  if (value === "invalid" || value === "risky" || value === "disposable") {
    return "invalid";
  }
  return "failed";
}

function firstErrorMessage(payload: AsterMdEmailVerifyApiResponse): string | null {
  const err = payload.error;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (Array.isArray(err)) {
    for (const item of err) {
      if (item && typeof item.message === "string" && item.message.trim()) {
        return item.message.trim();
      }
    }
  }
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
  return null;
}

/**
 * GET /v1/platform/extensions/email-verify?email=…
 * Validates via AsterMD Debounce integration. Do not log the email value.
 */
export async function verifyEmailAddress(email: string): Promise<EmailVerifyOutcome> {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    return {
      ok: false,
      result: "invalid",
      message: "Enter a valid email address",
      source: "live",
    };
  }

  const config = getAsterMdConfig();

  if (config.useMock) {
    // QA-ONLY mock: addresses containing "invalid" fail; others pass.
    const fail = /invalid/i.test(trimmed);
    return {
      ok: !fail,
      result: fail ? "invalid" : "valid",
      reason: fail ? "mock_invalid" : "mock_accepted",
      message: fail
        ? "This email could not be verified."
        : "Email looks valid.",
      source: "mock",
    };
  }

  let payload: AsterMdEmailVerifyApiResponse;
  try {
    payload = await asterMdFetch<AsterMdEmailVerifyApiResponse>({
      method: "GET",
      path: ASTERMD_ENDPOINTS.emailVerify(trimmed),
    });
  } catch (error) {
    if (error instanceof AsterMdError) {
      const details = error.details as AsterMdEmailVerifyApiResponse | undefined;
      const apiMessage = details ? firstErrorMessage(details) : null;
      return {
        ok: false,
        result: "failed",
        message:
          apiMessage ||
          error.userMessage ||
          "We could not verify this email. Please try again.",
        source: "live",
      };
    }
    throw error;
  }

  if (payload.success === false) {
    return {
      ok: false,
      result: "failed",
      message:
        firstErrorMessage(payload) ||
        "This email could not be verified. Please check and try again.",
      source: "live",
    };
  }

  const result = normalizeResult(payload.data?.result);
  const reason =
    typeof payload.data?.reason === "string" ? payload.data.reason : undefined;

  if (result === "valid") {
    return {
      ok: true,
      result,
      reason,
      message: "Email verified.",
      source: "live",
    };
  }

  if (result === "unknown") {
    return {
      ok: false,
      result,
      reason,
      message:
        "We could not confirm this email right now. Please try again in a moment.",
      source: "live",
    };
  }

  return {
    ok: false,
    result,
    reason,
    message:
      firstErrorMessage(payload) ||
      "This email does not appear to be valid. Please use a different address.",
    source: "live",
  };
}
