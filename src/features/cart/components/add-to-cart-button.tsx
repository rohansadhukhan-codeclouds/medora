"use client";

import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { catalogProductToCartItem } from "@/features/cart/lib/cart-product";
import type { CatalogProduct } from "@/features/catalog/lib/product-utils";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

type AddToCartButtonProps = {
  product: CatalogProduct;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function AddToCartButton({
  product,
  className,
  size = "default",
}: AddToCartButtonProps) {
  const { hasItem, addItem, removeItem } = useCart();
  const inCart = hasItem(product.id);

  return (
    <Button
      type="button"
      size={size}
      variant={inCart ? "outline" : "default"}
      className={cn(className)}
      onClick={() => {
        if (inCart) {
          removeItem(product.id);
          return;
        }
        addItem(catalogProductToCartItem(product));
      }}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          In cart — remove
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Add to cart
        </>
      )}
    </Button>
  );
}
