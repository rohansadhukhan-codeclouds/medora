import "server-only";
import type {
  AsterMdChannelDetail,
  AsterMdChannelDetailApiResponse,
} from "@/lib/api/astermd/channel-types";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import { getMockChannelDetailResponse } from "@/lib/api/astermd/mock-channel";

/**
 * GET /v1/sales/channels/detail/{id}
 * - ASTERMD_USE_MOCK=true → mock catalog (no token call)
 * - otherwise → live token + channel detail
 */
export async function getChannelDetail(
  channelId?: string,
): Promise<AsterMdChannelDetailApiResponse> {
  const config = getAsterMdConfig();

  if (config.useMock) {
    return getMockChannelDetailResponse();
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

  // Token acquired inside asterMdFetch via getAsterMdAccessToken().
  return asterMdFetch<AsterMdChannelDetailApiResponse>({
    method: "GET",
    path: ASTERMD_ENDPOINTS.channelDetail(id),
  });
}

export async function getChannelDetailData(
  channelId?: string,
): Promise<AsterMdChannelDetail> {
  const payload = await getChannelDetail(channelId);
  if (!payload.data?._id) {
    throw new AsterMdError({
      code: "not_found",
      message: "Channel detail payload missing data",
      userMessage: "Channel configuration could not be loaded.",
    });
  }
  return payload.data;
}
