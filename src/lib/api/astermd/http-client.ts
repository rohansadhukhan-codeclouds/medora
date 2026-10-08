import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import {
  getAsterMdAccessToken,
  refreshAsterMdAccessToken,
} from "@/lib/api/astermd/auth/token-manager";
import { AsterMdError, normalizeAsterMdError } from "@/lib/api/astermd/errors";

type AsterMdRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  /** Skip Authorization header (only for token endpoint). */
  skipAuth?: boolean;
  /** Internal: already retried after 401 refresh */
  _retried?: boolean;
};

function resolveBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

/**
 * Authenticated AsterMD HTTP helper.
 * Attaches Bearer token from secure server-side token state.
 */
export async function asterMdFetch<T = unknown>(
  options: AsterMdRequestOptions,
): Promise<T> {
  const config = getAsterMdConfig();

  if (!config.baseUrl) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD base URL is not configured",
      userMessage:
        "Our care partner is temporarily unavailable. Please try again shortly.",
    });
  }

  const url = `${resolveBaseUrl(config.baseUrl)}${options.path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!options.skipAuth) {
    const token = await getAsterMdAccessToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 401 && !options.skipAuth && !options._retried) {
      await refreshAsterMdAccessToken();
      return asterMdFetch<T>({ ...options, _retried: true });
    }

    const payload = (await response.json().catch(() => null)) as
      | (T & { message?: string; error?: string | { message?: string } })
      | null;

    if (!response.ok) {
      console.error("[AsterMD]", options.method ?? "GET", options.path, response.status);

      const apiMessage =
        (typeof payload?.message === "string" && payload.message) ||
        (typeof payload?.error === "string" && payload.error) ||
        (typeof payload?.error === "object" &&
          payload.error &&
          typeof payload.error.message === "string" &&
          payload.error.message) ||
        null;

      throw new AsterMdError({
        code:
          response.status === 401
            ? "unauthorized"
            : response.status === 404
              ? "not_found"
              : response.status === 400 || response.status === 422
                ? "validation_error"
                : "provider_unavailable",
        status: response.status,
        message: `AsterMD request failed: ${options.method ?? "GET"} ${options.path}`,
        userMessage:
          apiMessage ||
          "Our care partner is temporarily unavailable. Please try again shortly.",
        details: payload,
      });
    }

    return (payload ?? ({} as T)) as T;
  } catch (error) {
    throw normalizeAsterMdError(error);
  } finally {
    clearTimeout(timeout);
  }
}
