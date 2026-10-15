"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatProductPrice, getProductImageUrl } from "@/features/catalog/lib/product-utils";
import {
  EMPTY_CHECKOUT_ADDRESS,
  type CheckoutAddress,
} from "@/features/checkout/checkout-address";
import { CheckoutAddressFields } from "@/features/checkout/components/checkout-address-fields";
import {
  readCheckoutContactDraft,
  type CheckoutContactDraft,
} from "@/features/checkout/intake-checkout-draft";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

export function CheckoutPageView() {
  const { items, isEmpty, totalCents, refreshFromAsterMd } = useCart();
  const [contact, setContact] = useState<CheckoutContactDraft | null>(null);
  const [address, setAddress] = useState<CheckoutAddress>(EMPTY_CHECKOUT_ADDRESS);
  const [ready, setReady] = useState(false);
  const [placedHint, setPlacedHint] = useState(false);

  useEffect(() => {
    setContact(readCheckoutContactDraft());
    setReady(true);
    void refreshFromAsterMd();
  }, [refreshFromAsterMd]);

  const totalLabel = formatProductPrice(totalCents);
  const showLoading = !ready;

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
                Contact details are filled from your intake. Payment is static
                for now — live checkout APIs come next.
              </p>
            </div>
          </div>
        </Reveal>

        {showLoading ? (
          <div className="mt-10 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-20 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading checkout…
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Reveal trigger="mount">
              <form
                className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPlacedHint(true);
                }}
              >
                <section className="space-y-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Contact
                  </h2>
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
                    <CheckoutAddressFields
                      value={address}
                      onChange={setAddress}
                    />
                  </div>
                </section>

                <section className="space-y-4 border-t border-border pt-6">
                  <h2 className="text-base font-semibold text-foreground">
                    Card details
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Static preview only — do not enter real card data.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="card-name">Name on card</Label>
                      <Input
                        id="card-name"
                        defaultValue="Jane Patient"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="card-number">Card number</Label>
                      <Input
                        id="card-number"
                        defaultValue="4242 4242 4242 4242"
                        autoComplete="off"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">Expiry</Label>
                      <Input
                        id="card-expiry"
                        defaultValue="12 / 28"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvc">CVC</Label>
                      <Input
                        id="card-cvc"
                        defaultValue="123"
                        autoComplete="off"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </section>

                <div className="border-t border-border pt-6">
                  <Button type="submit" className="w-full sm:w-auto" disabled={isEmpty}>
                    Place order
                  </Button>
                  {placedHint ? (
                    <p className="mt-3 text-sm text-muted-foreground" role="status">
                      Static checkout — payment APIs will be wired in the next
                      phase.
                    </p>
                  ) : null}
                </div>
              </form>
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
