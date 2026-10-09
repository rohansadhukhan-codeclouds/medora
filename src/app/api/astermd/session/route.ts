import { NextRequest, NextResponse } from "next/server";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import {
  getUserFacingMessage,
  normalizeAsterMdError,
} from "@/lib/api/astermd/errors";
import {
  createSalesSession,
  viewSalesSession,
} from "@/lib/api/astermd/sessions";
import {
  clearVisitorSessionCookie,
  getVisitorSessionId,
  resolveClientIp,
  setVisitorSessionCookie,
} from "@/lib/session/visitor-session";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

/**
 * Ensure a visitor sales session exists (cookie + AsterMD create).
 * Idempotent: existing valid cookie is reused; invalid cookie is replaced.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getAsterMdConfig();

    if (
      !config.useMock &&
      (!config.baseUrl || !config.clientId || !config.clientSecret)
    ) {
      return NextResponse.json(
        { error: "AsterMD credentials are not configured on the server." },
        { status: 503, headers: NO_STORE },
      );
    }

    if (!config.useMock && !config.channelId) {
      return NextResponse.json(
        { error: "AsterMD channel id is not configured." },
        { status: 400, headers: NO_STORE },
      );
    }

    const existingId = await getVisitorSessionId();
    if (existingId) {
      try {
        const entry = await viewSalesSession(existingId);
        if (entry) {
          return NextResponse.json(
            {
              ok: true,
              created: false,
              sessionId: existingId,
              source: config.useMock ? "mock" : "reuse",
            },
            { headers: NO_STORE },
          );
        }
      } catch {
        await clearVisitorSessionCookie();
      }
    }

    const clientIp = resolveClientIp(request);
    const { sessionId } = await createSalesSession({ clientIp });
    await setVisitorSessionCookie(sessionId);

    return NextResponse.json(
      {
        ok: true,
        created: true,
        sessionId,
        source: config.useMock ? "mock" : "live",
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] session ensure error",
      normalized.code,
      normalized.status,
    );
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}

/**
 * Load the current visitor session journey from AsterMD view API.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = await getVisitorSessionId();
    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "No visitor session yet." },
        { status: 404, headers: NO_STORE },
      );
    }

    const tz =
      request.nextUrl.searchParams.get("tz")?.trim() || "Asia/Kolkata";
    const entry = await viewSalesSession(sessionId, tz);

    if (!entry) {
      return NextResponse.json(
        { ok: false, error: "Session not found." },
        { status: 404, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        sessionId,
        tz,
        data: entry.data ?? null,
        events: entry.events ?? [],
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] session view error",
      normalized.code,
      normalized.status,
    );
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}
