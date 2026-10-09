import "server-only";
import type { AsterMdChannelDetailApiResponse } from "@/lib/api/astermd/channel-types";

/**
 * ONLY place that caches AsterMD response bodies.
 * Scope: GET /v1/sales/channels/detail/{id} — nothing else
 * (patients, intakes, messages, token, etc. must not use this).
 */
/** Channel catalog cache TTL — refresh AsterMD after this window. */
export const CHANNEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type CachedChannelEntry = {
  channelId: string;
  payload: AsterMdChannelDetailApiResponse;
  /** Epoch ms when this entry was written */
  cachedAt: number;
  /** Epoch ms when this entry becomes invalid */
  expiresAt: number;
};

type ChannelCacheState = {
  entries: Map<string, CachedChannelEntry>;
  inflight: Map<string, Promise<AsterMdChannelDetailApiResponse>>;
};

const globalState = globalThis as typeof globalThis & {
  __medoraAsterMdChannelCache?: ChannelCacheState;
};

function cacheState(): ChannelCacheState {
  if (!globalState.__medoraAsterMdChannelCache) {
    globalState.__medoraAsterMdChannelCache = {
      entries: new Map(),
      inflight: new Map(),
    };
  }
  return globalState.__medoraAsterMdChannelCache;
}

export function getCachedChannel(
  channelId: string,
): CachedChannelEntry | null {
  const entry = cacheState().entries.get(channelId);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cacheState().entries.delete(channelId);
    return null;
  }
  return entry;
}

export function setCachedChannel(
  channelId: string,
  payload: AsterMdChannelDetailApiResponse,
  ttlMs: number = CHANNEL_CACHE_TTL_MS,
): CachedChannelEntry {
  const now = Date.now();
  const entry: CachedChannelEntry = {
    channelId,
    payload,
    cachedAt: now,
    expiresAt: now + ttlMs,
  };
  cacheState().entries.set(channelId, entry);
  return entry;
}

export function clearCachedChannel(channelId?: string): void {
  const state = cacheState();
  if (channelId) {
    state.entries.delete(channelId);
    state.inflight.delete(channelId);
    return;
  }
  state.entries.clear();
  state.inflight.clear();
}

/**
 * Return a cached payload when still valid; otherwise run `loader` once
 * per channel id (concurrent callers share the same in-flight promise).
 */
export async function getChannelWithCache(
  channelId: string,
  loader: () => Promise<AsterMdChannelDetailApiResponse>,
  options?: { force?: boolean },
): Promise<{
  payload: AsterMdChannelDetailApiResponse;
  cacheHit: boolean;
  cachedAt: number | null;
  expiresAt: number | null;
}> {
  if (!options?.force) {
    const cached = getCachedChannel(channelId);
    if (cached) {
      console.info(
        `[AsterMD] channel cache hit for ${channelId} (expires ${new Date(cached.expiresAt).toISOString()})`,
      );
      return {
        payload: cached.payload,
        cacheHit: true,
        cachedAt: cached.cachedAt,
        expiresAt: cached.expiresAt,
      };
    }
  } else {
    clearCachedChannel(channelId);
  }

  const state = cacheState();
  let request = state.inflight.get(channelId);

  if (!request) {
    request = (async () => {
      const payload = await loader();
      setCachedChannel(channelId, payload);
      return payload;
    })().finally(() => {
      if (state.inflight.get(channelId) === request) {
        state.inflight.delete(channelId);
      }
    });
    state.inflight.set(channelId, request);
  }

  const payload = await request;
  const entry = getCachedChannel(channelId);

  return {
    payload,
    cacheHit: false,
    cachedAt: entry?.cachedAt ?? null,
    expiresAt: entry?.expiresAt ?? null,
  };
}
