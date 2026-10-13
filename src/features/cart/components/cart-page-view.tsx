"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { formatProductPrice, getProductImageUrl } from "@/features/catalog/lib/product-utils";
import { useCart } from "@/hooks/use-cart";

export function CartPageView() {
  const {
    items,
    isEmpty,
    removeItem,
    clearCart,
    totalCents,
    syncError,
    isSyncing,
    refreshFromAsterMd,
  } = useCart();
  const totalLabel = formatProductPrice(totalCents);
  const [isPending, startTransition] = useTransition();
  const [hasLoadedView, setHasLoadedView] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshFromAsterMd();
      if (!cancelled) setHasLoadedView(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshFromAsterMd]);

  const showLoading = !hasLoadedView && isSyncing;
  const itemCountLabel = `${items.length} ${items.length === 1 ? "treatment" : "treatments"}`;

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_14%,transparent),_transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
        <Reveal trigger="mount">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Cart</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Review your selections
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Confirm your treatments, then continue to intake so a clinician
                can review your information.
              </p>
            </div>
            {!isEmpty && !showLoading ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending || isSyncing}
                className="self-start text-muted-foreground sm:self-auto"
                onClick={() => {
                  startTransition(async () => {
                    await clearCart();
                  });
                }}
              >
                Clear cart
              </Button>
            ) : null}
          </div>
        </Reveal>

        {syncError ? (
          <p
            className="rounded-xl border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {syncError}
          </p>
        ) : null}

        {showLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/90 px-4 py-20 text-sm text-muted-foreground shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading cart…
          </div>
        ) : isEmpty ? (
          <Reveal trigger="mount" delayMs={80}>
            <div className="rounded-2xl border border-dashed border-border bg-card/80 px-6 py-4 shadow-sm">
              <EmptyState
                icon={ShoppingBag}
                title="Your cart is empty"
                description="Browse treatments and add the ones you want to start with."
                action={
                  <Button asChild size="lg">
                    <Link href="/treatments">Browse treatments</Link>
                  </Button>
                }
              />
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Stagger
              as="ul"
              trigger="mount"
              className="space-y-4"
              aria-label="Cart items"
            >
              {items.map((item, index) => {
                const imageUrl = getProductImageUrl(item.image);
                return (
                  <StaggerItem
                    key={item.id}
                    as="li"
                    index={index}
                    className="motion-card-lift overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:h-28 sm:w-28">
                        <ProductImage
                          src={imageUrl}
                          alt={item.name}
                          fill
                          sizes="112px"
                          className="motion-image-zoom object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <Link
                          href={item.href}
                          className="motion-link-underline block text-lg font-semibold text-foreground hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Quantity fixed at 1 · clinical review required
                        </p>
                        <p className="text-base font-medium text-foreground">
                          {item.priceLabel ?? "Price on request"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || isSyncing}
                        className="self-start text-destructive hover:border-destructive/30 hover:bg-destructive-muted hover:text-destructive sm:self-center"
                        onClick={() => {
                          startTransition(async () => {
                            await removeItem(item.id);
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>

            <Reveal trigger="mount" delayMs={120}>
              <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Order summary
                </h2>
                <div className="mt-4 space-y-3 border-b border-border pb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{itemCountLabel}</span>
                    <span className="font-medium text-foreground">
                      {isSyncing ? "Syncing…" : "Ready"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Estimated total
                    </span>
                    <span className="text-xl font-semibold text-foreground">
                      {totalLabel ?? "TBD"}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Next step is a short medical intake. Final pricing and care
                  decisions are confirmed after clinician review.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/intake">
                      Continue
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/treatments">Keep browsing</Link>
                  </Button>
                </div>
              </aside>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}
