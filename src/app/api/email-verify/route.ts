import { NextRequest, NextResponse } from "next/server";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { verifyEmailAddress } from "@/lib/api/astermd/email-verify";
import {
  getUserFacingMessage,
  normalizeAsterMdError,
} from "@/lib/api/astermd/errors";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

/**
 * BFF: GET /api/email-verify?email=
 * Proxies AsterMD GET /v1/platform/extensions/email-verify (Debounce).
 * Never exposes tokens; does not echo the email back in error logs.
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")?.trim() ?? "";
    if (!email) {
      return NextResponse.json(
        { ok: false, result: "invalid", error: "Email is required." },
        { status: 400, headers: NO_STORE },
      );
    }

    const config = getAsterMdConfig();
    if (
      !config.useMock &&
      (!config.baseUrl || !config.clientId || !config.clientSecret)
    ) {
      return NextResponse.json(
        {
          ok: false,
          result: "failed",
          error: "AsterMD credentials are not configured on the server.",
        },
        { status: 503, headers: NO_STORE },
      );
    }

    const outcome = await verifyEmailAddress(email);
    return NextResponse.json(
      {
        ok: outcome.ok,
        result: outcome.result,
        reason: outcome.reason,
        message: outcome.message,
        source: outcome.source,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] email-verify error",
      normalized.code,
      normalized.status,
    );
    return NextResponse.json(
      {
        ok: false,
        result: "failed",
        error: getUserFacingMessage(normalized),
      },
      { status: normalized.status || 503, headers: NO_STORE },
    );
  }
}
