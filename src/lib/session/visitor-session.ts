import "server-only";
import { cookies } from "next/headers";

/** HttpOnly cookie that holds the AsterMD sales session UUID. */
export const VISITOR_SESSION_COOKIE = "medora_visitor_session_id";

/** 30 days — browsing session continuity across visits. */
const VISITOR_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function getVisitorSessionId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(VISITOR_SESSION_COOKIE)?.value?.trim();
  return value || null;
}

export async function setVisitorSessionCookie(sessionId: string): Promise<void> {
  const jar = await cookies();
  jar.set(VISITOR_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_SESSION_MAX_AGE_SEC,
  });
}

export async function clearVisitorSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(VISITOR_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Best-effort visitor IP for AsterMD X-Original-Client-Ip.
 * Prefer explicit forward headers from the edge/proxy.
 */
export function resolveClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return null;
}
