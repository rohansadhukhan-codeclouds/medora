"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { ArrowLeft, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { formatProductPrice, getProductImageUrl } from "@/features/catalog/lib/product-utils";
import { CheckoutOrderForm } from "@/features/checkout/components/checkout-order-form";
import {
  readCheckoutContactDraft,
  type CheckoutContactDraft,
} from "@/features/checkout/intake-checkout-draft";
import { clearIntakeDraft } from "@/features/intake/teleform/intake-draft-storage";
import { markIntakeResumeCompleted } from "@/features/intake/teleform/intake-resume-storage";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

export function CheckoutPageView() {
  const { items, isEmpty, totalCents, refreshFromAsterMd } = useCart();
  const [contact, setContact] = useState<CheckoutContactDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    markIntakeResumeCompleted();
    clearIntakeDraft();
    setContact(readCheckoutContactDraft());
    setReady(true);
    void refreshFromAsterMd();
  }, [refreshFromAsterMd]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/checkout/stripe", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          if (!cancelled) {
            setStripeError(payload.error || "Stripe is not configured.");
          }
          return;
        }
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          publishableKey?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!payload.ok || !payload.publishableKey) {
          setStripeError(payload.error || "Stripe is not configured.");
          return;
        }
        setStripePromise(loadStripe(payload.publishableKey));
      } catch {
        if (!cancelled) setStripeError("Unable to load Stripe.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLabel = formatProductPrice(totalCents);
  const elementsOptions = useMemo(
    () => ({
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#0f6e6e",
          colorBackground: "#ffffff",
          colorText: "#0f172a",
          colorDanger: "#dc2626",
          borderRadius: "8px",
        },
      },
    }),
    [],
  );

  const showLoading = !ready || (!stripePromise && !stripeError);

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_14%,transparent),_transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:py-16">
        <Reveal trigger="mount">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
            <Link href="/intake">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to intake
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-muted text-primary">
              <CreditCard className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">Checkout</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Complete your order
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Contact details are filled from your intake. Pay with Stripe to
                generate the order.
              </p>
            </div>
          </div>
        </Reveal>

        {showLoading ? (
          <div className="mt-10 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-20 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading checkout…
          </div>
        ) : stripeError ? (
          <div
            className="mt-10 rounded-2xl border border-destructive/20 bg-destructive-muted p-6 text-sm text-destructive"
            role="alert"
          >
            <p className="font-medium">Checkout is unavailable</p>
            <p className="mt-2">{stripeError}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Reveal trigger="mount">
              {stripePromise ? (
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CheckoutOrderForm
                    contact={contact}
                    items={items}
                    isEmpty={isEmpty}
                  />
                </Elements>
              ) : null}
            </Reveal>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-base font-semibold text-foreground">
                    Your cart
                  </h2>
                </div>

                {isEmpty ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Cart is empty.{" "}
                    <Link
                      href="/treatments"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      Browse treatments
                    </Link>
                  </p>
                ) : (
                  <ul className="mt-4 space-y-4" aria-label="Checkout products">
                    {items.map((item) => {
                      const imageUrl = getProductImageUrl(item.image);
                      return (
                        <li key={item.id} className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                            <ProductImage
                              src={imageUrl}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.priceLabel ||
                                formatProductPrice(item.priceCents) ||
                                "—"}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div
                  className={cn(
                    "mt-5 flex items-center justify-between border-t border-border pt-4 text-sm",
                  )}
                >
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {totalLabel || "—"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
