import "server-only";

/**
 * Server-only in-memory token state.
 * Never expose access_token to the browser or Client Components.
 */
export type StoredAsterMdToken = {
  accessToken: string;
  /** ISO-8601 expiry from AsterMD (`access_token_expiry`) */
  expiresAt: string;
  /** Epoch ms when this process cached the token */
  cachedAt: number;
};

let tokenState: StoredAsterMdToken | null = null;

export function getStoredToken(): StoredAsterMdToken | null {
  return tokenState;
}

export function setStoredToken(token: StoredAsterMdToken): void {
  tokenState = token;
}

export function clearStoredToken(): void {
  tokenState = null;
}

export function getTokenCacheSnapshot(): {
  hasToken: boolean;
  expiresAt: string | null;
  cachedAt: number | null;
} {
  return {
    hasToken: Boolean(tokenState?.accessToken),
    expiresAt: tokenState?.expiresAt ?? null,
    cachedAt: tokenState?.cachedAt ?? null,
  };
}
