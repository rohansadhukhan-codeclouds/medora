import { NextRequest, NextResponse } from "next/server";
import {
  getUserFacingMessage,
  normalizeAsterMdError,
} from "@/lib/api/astermd/errors";
import { bootstrapIntakeTeleform } from "@/lib/api/astermd/teleforms";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

/**
 * Bootstrap medical intake teleform (cached ~1 day on the server):
 * 1) GET teleforms/view/{ASTERMD_INTAKE_FORM_ID}
 * 2) GET teleforms/view-url/{form_json_identifier}  (%2F-encoded)
 * 3) Download form JSON from presigned view_url
 *
 * Query: ?force=1 bypasses the 1-day cache.
 */
export async function GET(request: NextRequest) {
  try {
    const force =
      request.nextUrl.searchParams.get("force") === "1" ||
      request.nextUrl.searchParams.get("force") === "true";

    const result = await bootstrapIntakeTeleform({ force });

    return NextResponse.json(
      {
        ok: true,
        teleformId: result.payload.teleformId,
        formJsonIdentifier: result.payload.formJsonIdentifier,
        teleform: result.payload.teleform,
        viewUrl: result.payload.viewUrl,
        formJson: result.payload.formJson,
        form: result.payload.form,
        cacheHit: result.cacheHit,
        cachedAt: result.cachedAt,
        expiresAt: result.expiresAt,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] teleform bootstrap error",
      normalized.code,
      normalized.status,
    );
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}
