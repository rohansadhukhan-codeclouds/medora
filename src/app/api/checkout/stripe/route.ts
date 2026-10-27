import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateCheckoutEvent } from "@/lib/api/astermd/checkout-events";
import { normalizeAsterMdError } from "@/lib/api/astermd/errors";
import { checkoutEventFromStripe } from "@/lib/payments/checkout-event-from-stripe";
import {
  getStripe,
  getStripePublishableKey,
  getStripeSecretKey,
  toPlainJson,
} from "@/lib/payments/stripe";
import { toStripeAmountCents } from "@/lib/payments/to-stripe-amount";
import { getOpportunityId } from "@/lib/session/opportunity-cookie";
import { getVisitorSessionId } from "@/lib/session/visitor-session";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;
const MIN_USD_CENTS = 50;

type CheckoutLine = {
  id: string;
  name: string;
  price: number;
  priceCents: number;
};

function readPrice(row: Record<string, unknown>): number {
  const raw = row.price ?? row.priceCents;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return NaN;
}

function parseLines(raw: unknown): CheckoutLine[] {
  if (!Array.isArray(raw)) return [];
  const lines: CheckoutLine[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const id = String(row.id ?? "").trim();
    const name = String(row.name ?? "").trim();
    const price = readPrice(row);
    if (!id || !name || !Number.isFinite(price) || price < 0) continue;
    lines.push({
      id,
      name,
      price,
      priceCents: toStripeAmountCents(price),
    });
  }
  return lines;
}

function readOptionalString(value: unknown, max = 120): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function countryCode(value: unknown): string | undefined {
  const raw = readOptionalString(value, 2);
  if (!raw || raw.length !== 2) return undefined;
  return raw.toUpperCase();
}

async function recordOrderCheckoutEvent(
  event: "order_placed" | "order_declined",
  paymentIntent: Stripe.PaymentIntent,
  items: CheckoutLine[],
): Promise<void> {
  const sessionId = await getVisitorSessionId();
  if (!sessionId) {
    console.warn("[AsterMD] skip checkout event update — no session");
    return;
  }

  try {
    const opportunityId = await getOpportunityId();
    const body = checkoutEventFromStripe({
      event,
      paymentIntent,
      items,
      opportunityId,
    });
    await updateCheckoutEvent(sessionId, body);
    console.log("[AsterMD] checkout event updated", {
      event: body.event,
      providerOrderIds: body.provider_order_id ?? [],
    });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] checkout event update failed",
      normalized.code,
      normalized.status,
    );
  }
}

/**
 * GET — publishable key only (never the secret).
 */
export async function GET() {
  const publishableKey = getStripePublishableKey();
  if (!publishableKey || !getStripeSecretKey()) {
    return NextResponse.json(
      { ok: false, error: "Stripe is not configured on the server." },
      { status: 503, headers: NO_STORE },
    );
  }

  return NextResponse.json(
    { ok: true, publishableKey },
    { headers: NO_STORE },
  );
}

/**
 * POST — create + confirm a Stripe PaymentIntent (order charge).
 * Card PAN never touches this BFF; client sends a payment_method id only.
 */
export async function POST(request: NextRequest) {
  if (!getStripeSecretKey()) {
    return NextResponse.json(
      { ok: false, error: "Stripe is not configured on the server." },
      { status: 503, headers: NO_STORE },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const retrieveId = readOptionalString(body.paymentIntentId, 80);
    const stripe = getStripe();

    if (retrieveId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(retrieveId, {
        expand: ["latest_charge", "payment_method"],
      });
      console.log("[Stripe] retrieved payment intent", {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
      const retrieveItems = parseLines(body.items);
      if (paymentIntent.status === "succeeded") {
        await recordOrderCheckoutEvent(
          "order_placed",
          paymentIntent,
          retrieveItems,
        );
      } else if (
        paymentIntent.status === "canceled" ||
        paymentIntent.status === "requires_payment_method"
      ) {
        await recordOrderCheckoutEvent(
          "order_declined",
          paymentIntent,
          retrieveItems,
        );
      }
      return NextResponse.json(
        {
          ok: true,
          action: "retrieve",
          paymentIntent: toPlainJson(paymentIntent),
        },
        { headers: NO_STORE },
      );
    }

    const paymentMethodId = readOptionalString(body.paymentMethodId, 80);
    if (!paymentMethodId || !paymentMethodId.startsWith("pm_")) {
      return NextResponse.json(
        { ok: false, error: "A Stripe payment method is required." },
        { status: 400, headers: NO_STORE },
      );
    }

    const items = parseLines(body.items);
    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Cart items with prices are required." },
        { status: 400, headers: NO_STORE },
      );
    }

    const amount = items.reduce((sum, item) => sum + item.priceCents, 0);
    console.log("[Stripe] checkout amounts", {
      items: items.map((item) => ({
        id: item.id,
        frontendPrice: item.price,
        stripeAmountCents: item.priceCents,
      })),
      totalCents: amount,
    });
    if (amount < MIN_USD_CENTS) {
      return NextResponse.json(
        {
          ok: false,
          error: "Order total is too small to charge.",
        },
        { status: 400, headers: NO_STORE },
      );
    }

    const contact =
      body.contact && typeof body.contact === "object"
        ? (body.contact as Record<string, unknown>)
        : {};
    const address =
      body.address && typeof body.address === "object"
        ? (body.address as Record<string, unknown>)
        : {};

    const email = readOptionalString(contact.email, 160);
    const name =
      readOptionalString(body.cardholderName, 80) ||
      readOptionalString(contact.name, 80);
    const phone = readOptionalString(contact.phone, 40);
    const line1 = readOptionalString(address.line1, 120);
    const city = readOptionalString(address.city, 80);
    const postalCode = readOptionalString(address.postalCode, 20);
    const country = countryCode(address.country);
    const sessionId = await getVisitorSessionId();
    const appUrl = process.env.APP_URL?.trim() || "http://localhost:3000";

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        allowed_payment_method_types: ["card"],
        ...(email ? { receipt_email: email } : {}),
        description: "Medora Health storefront order",
        return_url: `${appUrl}/checkout`,
        metadata: {
          source: "medora-checkout",
          item_ids: items
            .map((item) => item.id)
            .join(",")
            .slice(0, 450),
          item_count: String(items.length),
          ...(sessionId ? { session_id: sessionId } : {}),
        },
        shipping:
          name && line1 && city && postalCode && country
            ? {
                name,
                phone,
                address: {
                  line1,
                  line2: readOptionalString(address.line2, 120),
                  city,
                  state: readOptionalString(address.state, 40),
                  postal_code: postalCode,
                  country,
                },
              }
            : undefined,
        expand: ["latest_charge", "payment_method"],
      },
      {
        idempotencyKey:
          readOptionalString(request.headers.get("Idempotency-Key"), 80) ??
          undefined,
      },
    );

    const charge =
      paymentIntent.latest_charge &&
      typeof paymentIntent.latest_charge !== "string"
        ? paymentIntent.latest_charge
        : null;

    console.log("[Stripe] payment intent created", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      chargeId: charge?.id ?? paymentIntent.latest_charge ?? null,
    });

    if (paymentIntent.status === "succeeded") {
      await recordOrderCheckoutEvent("order_placed", paymentIntent, items);
    }

    return NextResponse.json(
      {
        ok: true,
        action: "pay",
        paymentIntent: toPlainJson(paymentIntent),
        charge: charge ? toPlainJson(charge) : null,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("[Stripe] payment error", {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
      });
      if (error.payment_intent) {
        await recordOrderCheckoutEvent(
          "order_declined",
          error.payment_intent,
          [],
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Stripe payment failed.",
          stripeError: toPlainJson({
            type: error.type,
            code: error.code,
            decline_code: error.decline_code,
            param: error.param,
            statusCode: error.statusCode,
            requestId: error.requestId,
            rawType: error.rawType,
            raw: error.raw,
          }),
        },
        { status: error.statusCode && error.statusCode >= 400 ? error.statusCode : 402, headers: NO_STORE },
      );
    }

    console.error("[Stripe] checkout route error");
    return NextResponse.json(
      { ok: false, error: "Unable to process payment. Please try again." },
      { status: 500, headers: NO_STORE },
    );
  }
}
