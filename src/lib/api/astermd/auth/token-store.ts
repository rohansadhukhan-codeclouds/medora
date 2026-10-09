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

const globalState = globalThis as typeof globalThis & {
  __medoraAsterMdToken?: StoredAsterMdToken | null;
};

function readToken(): StoredAsterMdToken | null {
  return globalState.__medoraAsterMdToken ?? null;
}

export function getStoredToken(): StoredAsterMdToken | null {
  return readToken();
}

export function setStoredToken(token: StoredAsterMdToken): void {
  globalState.__medoraAsterMdToken = token;
}

export function clearStoredToken(): void {
  globalState.__medoraAsterMdToken = null;
}

export function getTokenCacheSnapshot(): {
  hasToken: boolean;
  expiresAt: string | null;
  cachedAt: number | null;
} {
  const token = readToken();
  return {
    hasToken: Boolean(token?.accessToken),
    expiresAt: token?.expiresAt ?? null,
    cachedAt: token?.cachedAt ?? null,
  };
}
