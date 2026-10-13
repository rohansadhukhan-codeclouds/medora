"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { formatProductPrice, getProductImageUrl } from "@/features/catalog/lib/product-utils";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

type HeaderCartButtonProps = {
  className?: string;
  onNavigate?: () => void;
};

export function HeaderCartButton({
  className,
  onNavigate,
}: HeaderCartButtonProps) {
  const { items, count, totalCents, isEmpty, removeItem, isSyncing } = useCart();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const badgeCount = mounted ? count : 0;
  const totalLabel = formatProductPrice(totalCents);
  const showPreview = mounted && open;

  const openPreview = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Keep open long enough to move into the panel and interact.
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={openPreview}
      onMouseLeave={scheduleClose}
      onFocusCapture={openPreview}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        scheduleClose();
      }}
    >
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={
          badgeCount > 0 ? `Cart, ${badgeCount} items` : "Cart, empty"
        }
        aria-haspopup="dialog"
        aria-expanded={showPreview}
        aria-controls={panelId}
      >
        <Link href="/cart" onClick={onNavigate}>
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {badgeCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          ) : null}
        </Link>
      </Button>

      <div
        id={panelId}
        role="dialog"
        aria-label="Cart preview"
        data-open={showPreview ? "true" : "false"}
        className="motion-cart-preview absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-border bg-card p-3 shadow-lg"
      >
        {!mounted || isEmpty ? (
          <div className="motion-cart-preview-item px-2 py-6 text-center">
            <p className="text-sm font-medium text-foreground">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a treatment to see it here.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/treatments" onClick={onNavigate}>
                Browse treatments
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="motion-cart-preview-item"
                  style={{ ["--cart-item-index" as string]: String(index) }}
                >
                  <div className="group flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-accent">
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        <ProductImage
                          src={getProductImageUrl(item.image)}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="motion-image-zoom object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Qty 1 · {item.priceLabel ?? "Price on request"}
                        </p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1">
                      <p className="hidden text-sm font-medium text-foreground sm:block">
                        {item.priceLabel ?? "—"}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive-muted hover:text-destructive"
                        disabled={isPending || isSyncing}
                        aria-label={`Remove ${item.name}`}
                        onClick={() => {
                          startTransition(async () => {
                            await removeItem(item.id);
                          });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div
              className="motion-cart-preview-item mt-3 border-t border-border pt-3"
              style={{
                ["--cart-item-index" as string]: String(items.length),
              }}
            >
              <div className="flex items-center justify-between gap-3 px-1">
                <span className="text-sm text-muted-foreground">
                  Estimated total
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {totalLabel ?? "TBD"}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <Button asChild className="w-full" size="sm">
                  <Link href="/cart" onClick={onNavigate}>
                    View cart
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/intake" onClick={onNavigate}>
                    Continue to intake
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
