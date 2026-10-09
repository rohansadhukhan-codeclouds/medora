import { NextResponse } from "next/server";
import {
  acquireAsterMdToken,
  getAsterMdAccessToken,
} from "@/lib/api/astermd/auth/token-manager";
import { getTokenCacheSnapshot } from "@/lib/api/astermd/auth/token-store";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";

/**
 * Ensure a token exists in secure server state and report cache status.
 * The raw JWT is NEVER returned to the client.
 */
export async function POST() {
  try {
    const config = getAsterMdConfig();
    if (config.useMock) {
      return NextResponse.json(
        {
          ok: true,
          mock: true,
          hasToken: false,
          message: "Mock mode enabled — live token exchange is skipped.",
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    await acquireAsterMdToken();
    const snapshot = getTokenCacheSnapshot();
    return NextResponse.json(
      {
        ok: true,
        hasToken: snapshot.hasToken,
        expiresAt: snapshot.expiresAt,
        cachedAt: snapshot.cachedAt,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      {
        status: normalized.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}

export async function GET() {
  try {
    const config = getAsterMdConfig();
    if (config.useMock) {
      return NextResponse.json(
        {
          ok: true,
          mock: true,
          hasToken: false,
          message: "Mock mode enabled — live token exchange is skipped.",
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    // Warm/refresh token if needed, still without exposing it
    await getAsterMdAccessToken();
    const snapshot = getTokenCacheSnapshot();
    return NextResponse.json(
      {
        ok: true,
        hasToken: snapshot.hasToken,
        expiresAt: snapshot.expiresAt,
        cachedAt: snapshot.cachedAt,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      {
        status: normalized.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
