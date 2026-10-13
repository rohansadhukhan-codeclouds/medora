import { NextRequest, NextResponse } from "next/server";
import type { AsterMdCartLine } from "@/lib/api/astermd/cart-types";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import {
  getUserFacingMessage,
  normalizeAsterMdError,
} from "@/lib/api/astermd/errors";
import { syncSalesCart, viewSalesCart } from "@/lib/api/astermd/carts";
import { createSalesSession } from "@/lib/api/astermd/sessions";
import {
  getVisitorSessionId,
  resolveClientIp,
  setVisitorSessionCookie,
} from "@/lib/session/visitor-session";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

async function ensureVisitorSessionId(request: NextRequest): Promise<string> {
  const existing = await getVisitorSessionId();
  if (existing) return existing;

  const clientIp = resolveClientIp(request);
  const { sessionId } = await createSalesSession({ clientIp });
  await setVisitorSessionCookie(sessionId);
  return sessionId;
}

function parseItems(raw: unknown): AsterMdCartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const productId = String(row.product_id ?? row.productId ?? "").trim();
      const name = String(row.name ?? "").trim();
      const qtyRaw = row.qty;
      const qty =
        typeof qtyRaw === "number" && Number.isFinite(qtyRaw) && qtyRaw > 0
          ? Math.floor(qtyRaw)
          : 1;
      if (!productId || !name) return null;
      return { product_id: productId, name, qty };
    })
    .filter((item): item is AsterMdCartLine => Boolean(item));
}

/**
 * GET — view AsterMD cart for the visitor session UUID.
 */
export async function GET() {
  try {
    const config = getAsterMdConfig();
    if (
      !config.useMock &&
      (!config.baseUrl || !config.clientId || !config.clientSecret)
    ) {
      return NextResponse.json(
        { ok: false, error: "AsterMD credentials are not configured on the server." },
        { status: 503, headers: NO_STORE },
      );
    }

    const sessionId = await getVisitorSessionId();
    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "No visitor session yet.", data: null },
        { status: 404, headers: NO_STORE },
      );
    }

    const cart = await viewSalesCart(sessionId);
    if (!cart) {
      return NextResponse.json(
        {
          ok: true,
          sessionId,
          data: null,
          message: "No cart for this session yet.",
        },
        { headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { ok: true, sessionId, data: cart },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error("[AsterMD] cart view error", normalized.code, normalized.status);
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}

/**
 * POST — sync cart items to AsterMD.
 * Body: { items: [{ product_id, name, qty }] }
 * Ensures visitor session, then create (first time) or update (session path id).
 * Never accepts channel_id from the client.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getAsterMdConfig();
    if (
      !config.useMock &&
      (!config.baseUrl || !config.clientId || !config.clientSecret)
    ) {
      return NextResponse.json(
        { ok: false, error: "AsterMD credentials are not configured on the server." },
        { status: 503, headers: NO_STORE },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      items?: unknown;
    };
    const items = parseItems(body.items);

    const sessionId = await ensureVisitorSessionId(request);
    const { cart, created } = await syncSalesCart({ sessionId, items });

    return NextResponse.json(
      {
        ok: true,
        created,
        sessionId,
        cartId: cart._id ?? null,
        data: cart,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error("[AsterMD] cart sync error", normalized.code, normalized.status);
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}
