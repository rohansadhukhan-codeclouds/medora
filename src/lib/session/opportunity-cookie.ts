import "server-only";
import { cookies } from "next/headers";

/** HttpOnly cookie holding AsterMD opportunity Mongo `_id`. */
export const OPPORTUNITY_COOKIE = "medora_opportunity_id";

const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function getOpportunityId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(OPPORTUNITY_COOKIE)?.value?.trim();
  return value || null;
}

export async function setOpportunityCookie(opportunityId: string): Promise<void> {
  const jar = await cookies();
  jar.set(OPPORTUNITY_COOKIE, opportunityId, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearOpportunityCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(OPPORTUNITY_COOKIE, "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
