import "server-only";
import type {
  AsterMdCheckoutEventApiResponse,
  AsterMdCheckoutEventCreateBody,
  AsterMdCheckoutEventRecord,
  AsterMdCheckoutEventUpdateBody,
  AsterMdCheckoutUpsellItem,
} from "@/lib/api/astermd/checkout-event-types";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";

const globalState = globalThis as typeof globalThis & {
  __medoraMockCheckoutEvents?: AsterMdCheckoutEventRecord[];
};

function mockEvents(): AsterMdCheckoutEventRecord[] {
  if (!globalState.__medoraMockCheckoutEvents) {
    globalState.__medoraMockCheckoutEvents = [];
  }
  return globalState.__medoraMockCheckoutEvents;
}

function assertSessionId(sessionId: string): string {
  const id = sessionId.trim();
  if (!id) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD checkout event requires a session UUID",
      userMessage: "Your browsing session is missing. Please refresh the page.",
    });
  }
  return id;
}

function normalizeUpsell(raw: AsterMdCheckoutUpsellItem[] | undefined) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((item) => ({
      product_id: String(item.product_id ?? "").trim(),
      product_name: String(item.product_name ?? "").trim(),
    }))
    .filter((item) => item.product_id && item.product_name);
}

/**
 * POST /v1/sales/checkout-events/create
 * Lands `checkout_visited` on the session journey. Do not cache.
 */
export async function createCheckoutEvent(
  input: Omit<AsterMdCheckoutEventCreateBody, "session"> & {
    sessionId: string;
  },
): Promise<AsterMdCheckoutEventRecord> {
  const config = getAsterMdConfig();
  const sessionId = assertSessionId(input.sessionId);
  const discountCode = input.discount_code?.trim();

  const body: AsterMdCheckoutEventCreateBody = {
    session: sessionId,
    event: "checkout_visited",
    order_value: input.order_value,
    order_total: input.order_total,
    payment_method: input.payment_method.trim() || "card",
    currency: input.currency.trim() || "USD",
    upsell: normalizeUpsell(input.upsell),
    ...(discountCode ? { discount_code: discountCode } : {}),
  };

  if (config.useMock) {
    const record: AsterMdCheckoutEventRecord = {
      ...body,
      _id: `mock-checkout-event-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
    mockEvents().push(record);
    return record;
  }

  const payload = await asterMdFetch<AsterMdCheckoutEventApiResponse>({
    method: "POST",
    path: ASTERMD_ENDPOINTS.checkoutEventsCreate,
    body,
  });

  if (payload.success === false) {
    throw new AsterMdError({
      code: "unexpected",
      message: payload.message || "AsterMD checkout event create failed",
      userMessage: "Unable to record checkout visit. Please try again.",
    });
  }

  return payload.data ?? body;
}

/**
 * PUT /v1/sales/checkout-events/update/{session}
 * Stages: upsell_* and order_placed / order_declined. Do not cache.
 */
export async function updateCheckoutEvent(
  sessionId: string,
  input: AsterMdCheckoutEventUpdateBody,
): Promise<AsterMdCheckoutEventRecord> {
  const config = getAsterMdConfig();
  const id = assertSessionId(sessionId);
  const body: AsterMdCheckoutEventUpdateBody = {
    event: input.event,
    order_value: input.order_value,
    order_total: input.order_total,
    payment_method: input.payment_method.trim() || "card",
    currency: input.currency.trim() || "USD",
    ...(input.product_id?.trim()
      ? { product_id: input.product_id.trim() }
      : {}),
    ...(input.product_name?.trim()
      ? { product_name: input.product_name.trim() }
      : {}),
    ...(input.provider_order_id && input.provider_order_id.length > 0
      ? { provider_order_id: input.provider_order_id }
      : {}),
    ...(input.opportunity_id?.trim()
      ? { opportunity_id: input.opportunity_id.trim() }
      : {}),
    ...(input.payment ? { payment: input.payment } : {}),
  };

  if (config.useMock) {
    const record: AsterMdCheckoutEventRecord = {
      session: id,
      upsell: [],
      ...body,
      _id: `mock-checkout-event-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
    mockEvents().push(record);
    return record;
  }

  const payload = await asterMdFetch<AsterMdCheckoutEventApiResponse>({
    method: "PUT",
    path: ASTERMD_ENDPOINTS.checkoutEventsUpdate(id),
    body,
  });

  if (payload.success === false) {
    throw new AsterMdError({
      code: "unexpected",
      message: payload.message || "AsterMD checkout event update failed",
      userMessage: "Unable to record checkout status. Please try again.",
    });
  }

  return payload.data ?? { session: id, upsell: [], ...body };
}
