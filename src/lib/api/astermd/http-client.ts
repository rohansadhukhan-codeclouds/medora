import "server-only";
import {
  getAsterMdAccessToken,
  refreshAsterMdAccessToken,
} from "@/lib/api/astermd/auth/token-manager";
import { enqueueAuthenticatedCall } from "@/lib/api/astermd/auth/request-gate";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { AsterMdError, normalizeAsterMdError } from "@/lib/api/astermd/errors";

type AsterMdRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  /** Extra headers (e.g. X-Original-Client-Ip). Never pass Authorization here. */
  headers?: Record<string, string>;
  /** Skip Authorization header (only for the token endpoint). */
  skipAuth?: boolean;
  /** Internal: already retried after 401 refresh */
  _retried?: boolean;
};

function resolveBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

/**
 * Authenticated AsterMD HTTP helper.
 * Data calls stay queued until POST /v1/auth/api-credentials/token has stored
 * a usable access token. They are not sent while the token is missing,
 * expired, or still being requested.
 *
 * Never caches response bodies — every call uses `cache: "no-store"`.
 * The only AsterMD payload cache is channel detail via `channel-cache.ts`.
 */
export async function asterMdFetch<T = unknown>(
  options: AsterMdRequestOptions,
): Promise<T> {
  if (options.skipAuth) {
    return executeAsterMdRequest<T>(options);
  }

  return enqueueAuthenticatedCall(
    (accessToken) => executeAuthorized<T>(options, accessToken),
    getAsterMdAccessToken,
  );
}

async function executeAuthorized<T>(
  options: AsterMdRequestOptions,
  accessToken: string,
): Promise<T> {
  try {
    return await executeAsterMdRequest<T>(options, accessToken);
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    if (normalized.status === 401 && !options._retried) {
      const nextToken = await refreshAsterMdAccessToken();
      return executeAsterMdRequest<T>({ ...options, _retried: true }, nextToken);
    }
    throw normalized;
  }
}

async function executeAsterMdRequest<T>(
  options: AsterMdRequestOptions,
  accessToken?: string,
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

  if (!options.skipAuth && !accessToken) {
    throw new AsterMdError({
      code: "unauthorized",
      message: "AsterMD request blocked because no access token is stored",
      userMessage: "Unable to authenticate with the care partner.",
    });
  }

  const url = `${resolveBaseUrl(config.baseUrl)}${options.path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  // Authorization from the token gate always wins over caller headers.
  delete headers.Authorization;
  delete headers.authorization;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
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
