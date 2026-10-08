import { NextResponse } from "next/server";
import { getChannelDetail } from "@/lib/api/astermd/channels";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";

/**
 * BFF: fetch AsterMD channel detail using env channel id + server-side token.
 * Returns full channel `data` for Zustand hydration.
 * Never returns client_secret or access_token to the browser.
 */
export async function GET() {
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

    const payload = await getChannelDetail();
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

    return NextResponse.json({
      success: payload.success ?? true,
      message: payload.message ?? "Request successful",
      source: isMockFallback ? "mock" : "live",
      data,
    });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error("[AsterMD] channel route error", normalized.code, normalized.status);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}
