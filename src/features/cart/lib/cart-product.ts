import type { CatalogProduct } from "@/features/catalog/lib/product-utils";
import { getDisplayPrice } from "@/features/catalog/lib/product-utils";
import type { CartItem } from "@/stores/cart-store";

function resolvePriceCents(product: CatalogProduct): number | null {
  const { salePrice, introPrice, defaultPrice } = product.pricing;
  return salePrice ?? introPrice ?? defaultPrice ?? null;
}

export function catalogProductToCartItem(product: CatalogProduct): CartItem {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    priceCents: resolvePriceCents(product),
    priceLabel: getDisplayPrice(product),
    href: `/catalog/${encodeURIComponent(product.id)}`,
  };
}
