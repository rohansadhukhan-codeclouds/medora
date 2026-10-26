"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPTY_CHECKOUT_ADDRESS,
  type CheckoutAddress,
} from "@/features/checkout/checkout-address";
import { CheckoutAddressFields } from "@/features/checkout/components/checkout-address-fields";
import type { CheckoutContactDraft } from "@/features/checkout/intake-checkout-draft";
import type { CartItem } from "@/stores/cart-store";

type StripeCheckoutPayload = {
  ok: boolean;
  error?: string;
  action?: string;
  paymentIntent?: unknown;
  charge?: unknown;
  stripeError?: unknown;
};

type Props = {
  contact: CheckoutContactDraft | null;
  items: CartItem[];
  isEmpty: boolean;
};

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      fontFamily: "inherit",
      "::placeholder": { color: "#64748b" },
    },
    invalid: { color: "#dc2626" },
  },
};

function readIntentStatus(payload: StripeCheckoutPayload): string | null {
  const intent = payload.paymentIntent;
  if (!intent || typeof intent !== "object") return null;
  const status = (intent as { status?: unknown }).status;
  return typeof status === "string" ? status : null;
}

function readIntentId(payload: StripeCheckoutPayload): string | null {
  const intent = payload.paymentIntent;
  if (!intent || typeof intent !== "object") return null;
  const id = (intent as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}

export function CheckoutOrderForm({ contact, items, isEmpty }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [address, setAddress] = useState<CheckoutAddress>(EMPTY_CHECKOUT_ADDRESS);
  const [cardholderName, setCardholderName] = useState(contact?.name ?? "");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StripeCheckoutPayload | null>(null);
  const [cardHintOpen, setCardHintOpen] = useState(false);
  const submitLockRef = useRef(false);
  const cardHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardHintOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!cardHintRef.current?.contains(event.target as Node)) {
        setCardHintOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCardHintOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [cardHintOpen]);

  const paid =
    result?.ok === true && readIntentStatus(result) === "succeeded";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLockRef.current || placing || isEmpty || paid) return;
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card details are not ready yet. Please try again.");
      return;
    }

    submitLockRef.current = true;
    setPlacing(true);
    setError(null);

    try {
      const billingCountry =
        address.country.trim().length === 2
          ? address.country.trim().toUpperCase()
          : undefined;

      const paymentMethodResult = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          name: cardholderName.trim() || contact?.name || undefined,
          email: contact?.email || undefined,
          phone: contact?.phone || undefined,
          address: {
            line1: address.line1 || undefined,
            line2: address.line2 || undefined,
            city: address.city || undefined,
            state: address.state || undefined,
            postal_code: address.postalCode || undefined,
            country: billingCountry,
          },
        },
      });

      if (paymentMethodResult.error || !paymentMethodResult.paymentMethod) {
        const message =
          paymentMethodResult.error?.message ||
          "Could not read card details. Please try again.";
        setError(message);
        console.log("[checkout] stripe payment method error", paymentMethodResult);
        return;
      }

      console.log("[checkout] stripe payment method", paymentMethodResult.paymentMethod);

      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `checkout_${Date.now()}`;

      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        cache: "no-store",
        body: JSON.stringify({
          paymentMethodId: paymentMethodResult.paymentMethod.id,
          cardholderName: cardholderName.trim() || contact?.name || "",
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.priceCents ?? 0,
            priceCents: item.priceCents ?? 0,
          })),
          contact: {
            name: contact?.name ?? "",
            email: contact?.email ?? "",
            phone: contact?.phone ?? "",
          },
          address,
        }),
      });

      let payload = (await response.json().catch(() => ({}))) as StripeCheckoutPayload;
      if (!response.ok && payload.ok !== false) {
        payload = {
          ok: false,
          error: payload.error || "Payment failed. Please try again.",
          stripeError: payload.stripeError,
          paymentIntent: payload.paymentIntent,
          charge: payload.charge,
        };
      }
      console.log("[checkout] stripe API response", payload);

      const status = readIntentStatus(payload);
      const clientSecret =
        payload.paymentIntent && typeof payload.paymentIntent === "object"
          ? (payload.paymentIntent as { client_secret?: unknown }).client_secret
          : undefined;

      if (
        payload.ok &&
        status === "requires_action" &&
        typeof clientSecret === "string" &&
        clientSecret
      ) {
        const confirmed = await stripe.confirmCardPayment(clientSecret);
        console.log("[checkout] stripe 3DS confirm", confirmed);
        const intentId =
          confirmed.paymentIntent?.id || readIntentId(payload);
        if (confirmed.error) {
          payload = {
            ok: false,
            error: confirmed.error.message || "Authentication failed.",
            paymentIntent: confirmed.paymentIntent ?? payload.paymentIntent,
            stripeError: confirmed.error,
          };
        } else if (intentId) {
          const retrieveResponse = await fetch("/api/checkout/stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ paymentIntentId: intentId }),
          });
          payload = (await retrieveResponse.json().catch(() => ({}))) as StripeCheckoutPayload;
          console.log("[checkout] stripe retrieve response", payload);
        }
      }

      setResult(payload);
      if (!payload.ok) {
        setError(payload.error || "Payment failed. Please try again.");
      }
    } catch {
      setError("Unable to process payment. Please try again.");
    } finally {
      setPlacing(false);
      submitLockRef.current = false;
    }
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      onSubmit={handleSubmit}
    >
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="checkout-name">Name</Label>
            <Input
              id="checkout-name"
              value={contact?.name ?? ""}
              readOnly
              className="bg-muted/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              type="email"
              value={contact?.email ?? ""}
              readOnly
              className="bg-muted/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-phone">Phone</Label>
            <Input
              id="checkout-phone"
              type="tel"
              value={contact?.phone ?? ""}
              readOnly
              className="bg-muted/40"
            />
          </div>
        </div>
        {!contact?.name && !contact?.email ? (
          <p className="text-sm text-muted-foreground">
            No intake contact found.{" "}
            <Link href="/intake" className="text-primary underline-offset-2 hover:underline">
              Complete intake
            </Link>{" "}
            first.
          </p>
        ) : null}

        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Shipping address
          </h3>
          <CheckoutAddressFields value={address} onChange={setAddress} />
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-foreground">
            Card details
          </h2>
          <div className="relative" ref={cardHintRef}>
            <button
              type="button"
              className="motion-pressable inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Card details help"
              aria-expanded={cardHintOpen}
              aria-controls="card-details-hint"
              onClick={() => setCardHintOpen((open) => !open)}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
            {cardHintOpen ? (
              <div
                id="card-details-hint"
                role="tooltip"
                className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground shadow-md"
              >
                Card number is handled by Stripe. Use test card{" "}
                <span className="font-medium text-foreground">
                  4242 4242 4242 4242
                </span>
                .
              </div>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-name">Name on card</Label>
          <Input
            id="card-name"
            value={cardholderName}
            autoComplete="cc-name"
            onChange={(event) => setCardholderName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-element">Card number, expiry, CVC</Label>
          <div
            id="card-element"
            className="rounded-lg border border-input bg-card px-3 py-3"
          >
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">
            {paid ? "Payment succeeded" : "Stripe response"}
          </p>
          {readIntentId(result) ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {readIntentId(result)} · {readIntentStatus(result) ?? "unknown"}
            </p>
          ) : null}
          <pre className="mt-3 max-h-64 overflow-auto text-xs text-foreground">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="border-t border-border pt-6">
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isEmpty || placing || !stripe || paid}
          aria-busy={placing || undefined}
        >
          {placing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : paid ? (
            "Paid"
          ) : (
            "Place order"
          )}
        </Button>
      </div>
    </form>
  );
}
