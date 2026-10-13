import { NextRequest, NextResponse } from "next/server";
import { getChannelDetailWithMeta } from "@/lib/api/astermd/channels";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";

/**
 * BFF: fetch AsterMD channel detail using env channel id + server-side token.
 * Responses are served from a 1-day server cache unless `?force=1`.
 * Never returns client_secret or access_token to the browser.
 */
export async function GET(request: NextRequest) {
  try {
    const config = getAsterMdConfig();

    if (!config.baseUrl || !config.clientId || !config.clientSecret) {
      return NextResponse.json(
        { error: "AsterMD credentials are not configured on the server." },
        { status: 503 },
      );
    }

    if (!config.channelId) {
      return NextResponse.json(
        { error: "AsterMD channel id is not configured." },
        { status: 400 },
      );
    }

    const force =
      request.nextUrl.searchParams.get("force") === "1" ||
      request.nextUrl.searchParams.get("force") === "true";

    const { payload, cacheHit, cachedAt, expiresAt } =
      await getChannelDetailWithMeta(undefined, { force });
    const data = payload.data;

    if (!data || typeof data !== "object" || !("_id" in data) || !data._id) {
      console.error("[AsterMD] channel detail missing data._id");
      return NextResponse.json(
        {
          error:
            payload.message ||
            "Channel configuration could not be loaded.",
        },
        { status: 502 },
      );
    }

    const isMockFallback =
      typeof payload.message === "string" &&
      payload.message.toLowerCase().includes("mock");

    // HTTP itself is no-store; the 1-day TTL lives only in channel-cache.ts
    // so browsers/CDNs do not treat this like a generic cacheable API.
    const headers = new Headers({
      "Cache-Control": "private, no-store",
    });

    return NextResponse.json(
      {
        success: payload.success ?? true,
        message: payload.message ?? "Request successful",
        source: isMockFallback ? "mock" : cacheHit ? "cache" : "live",
        cachedAt: cachedAt ? new Date(cachedAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        data,
      },
      { headers },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error("[AsterMD] channel route error", normalized.code, normalized.status);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}
