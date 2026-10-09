"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { count } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const badgeCount = mounted ? count : 0;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label={
        badgeCount > 0 ? `Cart, ${badgeCount} items` : "Cart, empty"
      }
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
  );
}
