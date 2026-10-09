import "server-only";
import type {
  AsterMdChannelDetail,
  AsterMdChannelDetailApiResponse,
} from "@/lib/api/astermd/channel-types";
import {
  getChannelWithCache,
} from "@/lib/api/astermd/channel-cache";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import { getMockChannelDetailResponse } from "@/lib/api/astermd/mock-channel";

export type GetChannelDetailOptions = {
  /** Bypass the 1-day server cache and call AsterMD again. */
  force?: boolean;
};

export type ChannelDetailResult = {
  payload: AsterMdChannelDetailApiResponse;
  cacheHit: boolean;
  cachedAt: number | null;
  expiresAt: number | null;
};

/**
 * GET /v1/sales/channels/detail/{id}
 * This is the only AsterMD data endpoint we cache (1 day server TTL).
 * Concurrent callers share one in-flight AsterMD request.
 */
export async function getChannelDetail(
  channelId?: string,
  options?: GetChannelDetailOptions,
): Promise<AsterMdChannelDetailApiResponse> {
  const result = await getChannelDetailWithMeta(channelId, options);
  return result.payload;
}

export async function getChannelDetailWithMeta(
  channelId?: string,
  options?: GetChannelDetailOptions,
): Promise<ChannelDetailResult> {
  const config = getAsterMdConfig();

  if (config.useMock) {
    const payload = getMockChannelDetailResponse();
    return {
      payload,
      cacheHit: false,
      cachedAt: null,
      expiresAt: null,
    };
  }

  const id = channelId ?? config.channelId;

  if (
    !config.baseUrl ||
    !config.clientId ||
    !config.clientSecret ||
    !id
  ) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD channel credentials are not configured",
      userMessage: "Channel configuration is missing.",
    });
  }

  return getChannelWithCache(
    id,
    async () => {
      console.info(
        `[AsterMD] channel cache miss — fetching GET ${ASTERMD_ENDPOINTS.channelDetail(id)}`,
      );
      return asterMdFetch<AsterMdChannelDetailApiResponse>({
        method: "GET",
        path: ASTERMD_ENDPOINTS.channelDetail(id),
      });
    },
    { force: options?.force },
  );
}

export async function getChannelDetailData(
  channelId?: string,
  options?: GetChannelDetailOptions,
): Promise<AsterMdChannelDetail> {
  const payload = await getChannelDetail(channelId, options);
  if (!payload.data?._id) {
    throw new AsterMdError({
      code: "not_found",
      message: "Channel detail payload missing data",
      userMessage: "Channel configuration could not be loaded.",
    });
  }
  return payload.data;
}
