import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  type StoredAsterMdToken,
} from "@/lib/api/astermd/auth/token-store";

/** Refresh slightly before real expiry to avoid edge 401s */
const EXPIRY_PREBUFFER_MS = 60_000;

const globalState = globalThis as typeof globalThis & {
  __medoraAsterMdTokenInflight?: Promise<StoredAsterMdToken> | null;
  __medoraAsterMdTokenGeneration?: number;
  __medoraAsterMdRefresh?: Promise<string> | null;
};

type TokenResponseBody = {
  success?: boolean;
  message?: string;
  data?: {
    access_token?: string;
    access_token_expiry?: string;
  };
  access_token?: string;
  access_token_expiry?: string;
};

function resolveBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function isExpired(token: StoredAsterMdToken, prebufferMs = EXPIRY_PREBUFFER_MS): boolean {
  const expiresAtMs = Date.parse(token.expiresAt);
  if (Number.isNaN(expiresAtMs)) {
    return true;
  }
  return Date.now() >= expiresAtMs - prebufferMs;
}

function parseTokenPayload(payload: TokenResponseBody): StoredAsterMdToken {
  const data = payload.data ?? payload;
  const accessToken = data.access_token;
  const expiresAt = data.access_token_expiry;

  if (!accessToken || !expiresAt) {
    throw new AsterMdError({
      code: "unauthorized",
      message: "Token response missing access_token / access_token_expiry",
      userMessage: "Unable to authenticate with the care partner.",
    });
  }

  return {
    accessToken,
    expiresAt,
    cachedAt: Date.now(),
  };
}

/**
 * Exchange client_id + client_secret for a JWT.
 * POST {BASE_URL}/v1/auth/api-credentials/token
 * One in-flight request is shared by every waiter.
 */
function currentGeneration(): number {
  return globalState.__medoraAsterMdTokenGeneration ?? 0;
}

function startTokenRequest(): Promise<StoredAsterMdToken> {
  if (!globalState.__medoraAsterMdTokenInflight) {
    const generation = currentGeneration();
    console.info(
      "[AsterMD] access token missing or expired — requesting POST /v1/auth/api-credentials/token",
    );
    const request = requestAsterMdToken(generation).finally(() => {
      if (globalState.__medoraAsterMdTokenInflight === request) {
        globalState.__medoraAsterMdTokenInflight = null;
      }
    });
    globalState.__medoraAsterMdTokenInflight = request;
  }
  return globalState.__medoraAsterMdTokenInflight;
}

async function requestAsterMdToken(generation: number): Promise<StoredAsterMdToken> {
  const config = getAsterMdConfig();

  if (config.useMock) {
    throw new AsterMdError({
      code: "provider_unavailable",
      status: 503,
      message: "AsterMD token acquisition skipped while ASTERMD_USE_MOCK=true",
      userMessage:
        "Live AsterMD auth is disabled while mock mode is enabled. Set ASTERMD_USE_MOCK=false to use real credentials.",
    });
  }

  if (!config.baseUrl || !config.clientId || !config.clientSecret) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD credentials are not configured",
      userMessage:
        "Our care partner is temporarily unavailable. Please try again shortly.",
    });
  }

  const url = `${resolveBaseUrl(config.baseUrl)}${ASTERMD_ENDPOINTS.authToken}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => ({}))) as TokenResponseBody;

    if (!response.ok) {
      console.error(
        "[AsterMD] token request failed",
        response.status,
        typeof payload.message === "string" ? payload.message : undefined,
      );
      throw new AsterMdError({
        code: response.status === 401 ? "unauthorized" : "provider_unavailable",
        status: response.status,
        message: `AsterMD token request failed with status ${response.status}`,
        userMessage:
          payload.message ||
          "Unable to authenticate with the care partner. Please try again shortly.",
      });
    }

    const token = parseTokenPayload(payload);
    if (generation !== currentGeneration()) {
      throw new AsterMdError({
        code: "unauthorized",
        message: "Discarded stale AsterMD token response",
        userMessage: "Unable to authenticate with the care partner.",
      });
    }
    setStoredToken(token);
    return token;
  } catch (error) {
    clearStoredToken();
    throw normalizeAsterMdError(error);
  } finally {
    clearTimeout(timeout);
  }
}

function readUsableToken(): StoredAsterMdToken | null {
  const cached = getStoredToken();
  if (!cached?.accessToken || isExpired(cached)) {
    return null;
  }
  return cached;
}

/**
 * Returns the stored token when it is still valid.
 * Otherwise waits on a single POST /v1/auth/api-credentials/token.
 * Does not return until that token is stored.
 */
export async function acquireAsterMdToken(): Promise<StoredAsterMdToken> {
  const cached = readUsableToken();
  if (cached) return cached;
  return startTokenRequest();
}

/**
 * Returns a valid bearer token from server state, refreshing when needed.
 * Token never leaves the server process.
 */
export async function getAsterMdAccessToken(): Promise<string> {
  const token = await acquireAsterMdToken();
  return token.accessToken;
}

/** Drop the current token and wait for a new one (used after 401). */
export function refreshAsterMdAccessToken(): Promise<string> {
  if (!globalState.__medoraAsterMdRefresh) {
    const refresh = (async () => {
      globalState.__medoraAsterMdTokenGeneration = currentGeneration() + 1;
      clearStoredToken();
      globalState.__medoraAsterMdTokenInflight = null;
      const token = await startTokenRequest();
      return token.accessToken;
    })().finally(() => {
      if (globalState.__medoraAsterMdRefresh === refresh) {
        globalState.__medoraAsterMdRefresh = null;
      }
    });
    globalState.__medoraAsterMdRefresh = refresh;
  }
  return globalState.__medoraAsterMdRefresh;
}
