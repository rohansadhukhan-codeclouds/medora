import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildDevInspectorPayload } from "@/lib/dev-inspector/build-payload";
import {
  clearDevApiHistory,
} from "@/lib/dev-inspector/server-trace-store";
import { DEV_INSPECTOR_COOKIE } from "@/lib/dev-inspector/types";
import { isDevAppEnv } from "@/lib/env";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

function notFound() {
  return NextResponse.json({ ok: false }, { status: 404, headers: NO_STORE });
}

async function ensureDevInspectorCookie(): Promise<void> {
  const jar = await cookies();
  const existing = jar.get(DEV_INSPECTOR_COOKIE)?.value?.trim();
  if (existing) return;
  const id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  jar.set(DEV_INSPECTOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * DEV-ONLY inspector payload. Outside APP_ENV=dev → 404 (no existence leak).
 */
export async function GET() {
  if (!isDevAppEnv()) return notFound();

  try {
    await ensureDevInspectorCookie();
    const payload = await buildDevInspectorPayload();
    return NextResponse.json({ ok: true, ...payload }, { headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Inspector unavailable" },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function DELETE() {
  if (!isDevAppEnv()) return notFound();

  try {
    await clearDevApiHistory();
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to clear history" },
      { status: 500, headers: NO_STORE },
    );
  }
}
