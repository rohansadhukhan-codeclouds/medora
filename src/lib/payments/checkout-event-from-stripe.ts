import "server-only";
import type Stripe from "stripe";
import type { AsterMdCheckoutEventUpdateBody } from "@/lib/api/astermd/checkout-event-types";

type CheckoutLine = {
  id: string;
  name: string;
};

function padMonth(month: number): string {
  return String(month).padStart(2, "0");
}

function twoDigitYear(year: number): string {
  return String(year).slice(-2);
}

function readCard(paymentIntent: Stripe.PaymentIntent): {
  type: string;
  bin?: string;
  exp?: string;
} | undefined {
  const method =
    paymentIntent.payment_method &&
    typeof paymentIntent.payment_method !== "string"
      ? paymentIntent.payment_method
      : null;
  const fromMethod = method?.card;
  const charge =
    paymentIntent.latest_charge &&
    typeof paymentIntent.latest_charge !== "string"
      ? paymentIntent.latest_charge
      : null;
  const fromCharge = charge?.payment_method_details?.card;

  const brand = fromMethod?.brand || fromCharge?.brand;
  if (!brand) return undefined;

  const expMonth = fromMethod?.exp_month ?? fromCharge?.exp_month;
  const expYear = fromMethod?.exp_year ?? fromCharge?.exp_year;
  const iin =
    (fromMethod && "iin" in fromMethod
      ? (fromMethod.iin as string | null | undefined)
      : undefined) ||
    (fromCharge && "iin" in fromCharge
      ? (fromCharge.iin as string | null | undefined)
      : undefined);

  return {
    type: brand,
    ...(iin ? { bin: iin } : {}),
    ...(typeof expMonth === "number" && typeof expYear === "number"
      ? { exp: `${padMonth(expMonth)}/${twoDigitYear(expYear)}` }
      : {}),
  };
}

/**
 * Map a Stripe PaymentIntent + cart line into AsterMD checkout-event update body.
 * Never copies PAN — brand / optional IIN / expiry only.
 */
export function checkoutEventFromStripe(input: {
  event: "order_placed" | "order_declined";
  paymentIntent: Stripe.PaymentIntent;
  items: CheckoutLine[];
  opportunityId?: string | null;
}): AsterMdCheckoutEventUpdateBody {
  const orderTotal = Number((input.paymentIntent.amount / 100).toFixed(2));
  const first = input.items[0];
  const card = readCard(input.paymentIntent);
  const providerIds = input.paymentIntent.id.startsWith("pi_")
    ? [input.paymentIntent.id]
    : [];

  return {
    event: input.event,
    ...(first?.id ? { product_id: first.id } : {}),
    ...(first?.name ? { product_name: first.name } : {}),
    order_value: orderTotal,
    order_total: orderTotal,
    payment_method: "card",
    currency: (input.paymentIntent.currency || "usd").toUpperCase(),
    ...(providerIds.length > 0 ? { provider_order_id: providerIds } : {}),
    ...(input.opportunityId?.trim()
      ? { opportunity_id: input.opportunityId.trim() }
      : {}),
    payment: {
      type: "credit_card",
      pre_auth: false,
      pre_auth_qa: false,
      pre_auth_amount: orderTotal,
      ...(card ? { card } : {}),
    },
  };
}
