"use client";

import Link from "next/link";
import { useEffect, useTransition } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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

  useEffect(() => {
    void refreshFromAsterMd();
  }, [refreshFromAsterMd]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-16 sm:px-6">
      <PageHeader
        title="Your cart"
        description="Selected treatments stay in your cart until you continue or remove them."
        actions={
          !isEmpty ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || isSyncing}
              onClick={() => {
                startTransition(async () => {
                  await clearCart();
                });
              }}
            >
              Clear cart
            </Button>
          ) : null
        }
      />

      {syncError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive" role="alert">
          {syncError}
        </p>
      ) : null}

      {isEmpty ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse treatments and add the ones you want to start with."
          action={
            <Button asChild>
              <Link href="/treatments">Browse treatments</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {items.map((item) => {
              const imageUrl = getProductImageUrl(item.image);
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <ProductImage
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={item.href}
                        className="block truncate text-base font-semibold text-foreground hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.priceLabel ?? "Price on request"}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending || isSyncing}
                    className="self-start text-destructive hover:bg-destructive-muted hover:text-destructive sm:self-center"
                    onClick={() => {
                      startTransition(async () => {
                        await removeItem(item.id);
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
                {isSyncing ? " · syncing…" : null}
              </p>
              {totalLabel ? (
                <p className="mt-1 text-xl font-semibold text-foreground">
                  Estimated total {totalLabel}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Final pricing confirmed after clinician review.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/treatments">Keep browsing</Link>
              </Button>
              <Button asChild>
                <Link href="/eligibility">Continue</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
