import "server-only";
import type { TeleformBootstrapResult } from "@/lib/api/astermd/teleforms";

/** Teleform bootstrap cache TTL — refresh AsterMD after this window. */
export const TELEFORM_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh presigned view_url this many ms before it expires. */
const VIEW_URL_EXPIRY_BUFFER_MS = 60_000;

export type CachedTeleformEntry = {
  teleformId: string;
  payload: TeleformBootstrapResult;
  /** Epoch ms when the 1-day bootstrap entry was first written */
  cachedAt: number;
  /** Epoch ms when this 1-day entry becomes invalid */
  expiresAt: number;
  /** Epoch ms when the current view_url payload was written */
  viewUrlCachedAt: number;
};

type TeleformCacheState = {
  entries: Map<string, CachedTeleformEntry>;
  inflight: Map<string, Promise<TeleformBootstrapResult>>;
};

const globalState = globalThis as typeof globalThis & {
  __medoraAsterMdTeleformCache?: TeleformCacheState;
};

function cacheState(): TeleformCacheState {
  if (!globalState.__medoraAsterMdTeleformCache) {
    globalState.__medoraAsterMdTeleformCache = {
      entries: new Map(),
      inflight: new Map(),
    };
  }
  return globalState.__medoraAsterMdTeleformCache;
}

export function getCachedTeleform(
  teleformId: string,
): CachedTeleformEntry | null {
  const entry = cacheState().entries.get(teleformId);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cacheState().entries.delete(teleformId);
    return null;
  }
  return entry;
}

export function setCachedTeleform(
  teleformId: string,
  payload: TeleformBootstrapResult,
  options?: { ttlMs?: number; preserveExpiresAt?: number },
): CachedTeleformEntry {
  const now = Date.now();
  const ttlMs = options?.ttlMs ?? TELEFORM_CACHE_TTL_MS;
  const entry: CachedTeleformEntry = {
    teleformId,
    payload,
    cachedAt: now,
    expiresAt: options?.preserveExpiresAt ?? now + ttlMs,
    viewUrlCachedAt: now,
  };
  cacheState().entries.set(teleformId, entry);
  return entry;
}

export function clearCachedTeleform(teleformId?: string): void {
  const state = cacheState();
  if (teleformId) {
    state.entries.delete(teleformId);
    state.inflight.delete(teleformId);
    return;
  }
  state.entries.clear();
  state.inflight.clear();
}

/** True when the cached presigned URL is still safe to serve. */
export function isTeleformViewUrlFresh(
  payload: TeleformBootstrapResult,
  viewUrlCachedAt: number,
  now: number = Date.now(),
): boolean {
  const expiresInSec = payload.viewUrl.data?.expires_in;
  if (typeof expiresInSec !== "number" || expiresInSec <= 0) {
    return false;
  }
  return (
    now < viewUrlCachedAt + expiresInSec * 1000 - VIEW_URL_EXPIRY_BUFFER_MS
  );
}

/**
 * Return cached teleform bootstrap when still valid; otherwise run `loader`
 * once per teleform id (concurrent callers share the same in-flight promise).
 *
 * Presigned `view_url` values expire sooner than the 1-day bootstrap TTL, so
 * `refreshViewUrl` re-runs only step 2 when needed.
 */
export async function getTeleformWithCache(
  teleformId: string,
  loader: () => Promise<TeleformBootstrapResult>,
  options?: {
    force?: boolean;
    refreshViewUrl?: (
      cached: TeleformBootstrapResult,
    ) => Promise<TeleformBootstrapResult>;
  },
): Promise<{
  payload: TeleformBootstrapResult;
  cacheHit: boolean;
  cachedAt: number | null;
  expiresAt: number | null;
}> {
  if (options?.force) {
    clearCachedTeleform(teleformId);
  } else {
    const cached = getCachedTeleform(teleformId);
    if (cached) {
      if (isTeleformViewUrlFresh(cached.payload, cached.viewUrlCachedAt)) {
        console.info(
          `[AsterMD] teleform cache hit for ${teleformId} (expires ${new Date(cached.expiresAt).toISOString()})`,
        );
        return {
          payload: cached.payload,
          cacheHit: true,
          cachedAt: cached.cachedAt,
          expiresAt: cached.expiresAt,
        };
      }

      if (options?.refreshViewUrl) {
        console.info(
          `[AsterMD] teleform cache hit for ${teleformId} — refreshing expired view-url`,
        );
        const refreshed = await options.refreshViewUrl(cached.payload);
        const entry = setCachedTeleform(teleformId, refreshed, {
          preserveExpiresAt: cached.expiresAt,
        });
        // Keep original bootstrap timestamp for the 1-day window.
        entry.cachedAt = cached.cachedAt;
        cacheState().entries.set(teleformId, entry);

        return {
          payload: refreshed,
          cacheHit: true,
          cachedAt: entry.cachedAt,
          expiresAt: entry.expiresAt,
        };
      }
    }
  }

  const state = cacheState();
  let request = state.inflight.get(teleformId);

  if (!request) {
    request = (async () => {
      const payload = await loader();
      setCachedTeleform(teleformId, payload);
      return payload;
    })().finally(() => {
      if (state.inflight.get(teleformId) === request) {
        state.inflight.delete(teleformId);
      }
    });
    state.inflight.set(teleformId, request);
  }

  const payload = await request;
  const entry = getCachedTeleform(teleformId);

  return {
    payload,
    cacheHit: false,
    cachedAt: entry?.cachedAt ?? null,
    expiresAt: entry?.expiresAt ?? null,
  };
}
