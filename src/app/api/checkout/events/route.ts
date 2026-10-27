import { NextRequest, NextResponse } from "next/server";
import { createCheckoutEvent } from "@/lib/api/astermd/checkout-events";
import type { AsterMdCheckoutUpsellItem } from "@/lib/api/astermd/checkout-event-types";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import {
  getUserFacingMessage,
  normalizeAsterMdError,
} from "@/lib/api/astermd/errors";
import { createSalesSession } from "@/lib/api/astermd/sessions";
import { toMajorAmount } from "@/lib/payments/to-stripe-amount";
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

function parseItems(raw: unknown): { price: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const priceRaw = row.price ?? row.priceCents;
      const price =
        typeof priceRaw === "number"
          ? priceRaw
          : typeof priceRaw === "string"
            ? Number(priceRaw)
            : NaN;
      if (!Number.isFinite(price) || price < 0) return { price: 0 };
      return { price };
    })
    .filter((item): item is { price: number } => Boolean(item));
}

function parseUpsell(raw: unknown): AsterMdCheckoutUpsellItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const product_id = String(row.product_id ?? row.id ?? "").trim();
      const product_name = String(
        row.product_name ?? row.name ?? "",
      ).trim();
      if (!product_id || !product_name) return null;
      return { product_id, product_name };
    })
    .filter((item): item is AsterMdCheckoutUpsellItem => Boolean(item));
}

/**
 * POST — record checkout_visited on AsterMD when the storefront checkout page opens.
 * Session comes from the HttpOnly cookie (created if missing). Never log full payloads.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getAsterMdConfig();
    if (
      !config.useMock &&
      (!config.baseUrl || !config.clientId || !config.clientSecret)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "AsterMD credentials are not configured on the server.",
        },
        { status: 503, headers: NO_STORE },
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const items = parseItems(body.items);
    const orderTotal = Number(
      items
        .reduce((sum, item) => sum + toMajorAmount(item.price), 0)
        .toFixed(2),
    );
    const paymentMethod =
      typeof body.payment_method === "string" && body.payment_method.trim()
        ? body.payment_method.trim()
        : "card";
    const currency =
      typeof body.currency === "string" && body.currency.trim()
        ? body.currency.trim()
        : "USD";
    const discountCode =
      typeof body.discount_code === "string" ? body.discount_code.trim() : "";

    const sessionId = await ensureVisitorSessionId(request);
    const record = await createCheckoutEvent({
      sessionId,
      event: "checkout_visited",
      order_value: orderTotal,
      order_total: orderTotal,
      payment_method: paymentMethod,
      currency,
      upsell: parseUpsell(body.upsell),
      ...(discountCode ? { discount_code: discountCode } : {}),
    });

    console.log("[AsterMD] checkout event created", {
      event: "checkout_visited",
      order_value: orderTotal,
      order_total: orderTotal,
      currency,
      upsellCount: Array.isArray(record.upsell) ? record.upsell.length : 0,
    });

    return NextResponse.json(
      {
        ok: true,
        sessionId,
        eventId: record._id ?? record.id ?? null,
        data: record,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] checkout event error",
      normalized.code,
      normalized.status,
    );
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}
