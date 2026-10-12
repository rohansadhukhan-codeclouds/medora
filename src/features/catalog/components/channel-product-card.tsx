"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductImage } from "@/components/shared/product-image";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { CatalogProduct } from "@/features/catalog/lib/product-utils";
import {
  getDisplayPrice,
  getProductImageUrl,
} from "@/features/catalog/lib/product-utils";

type ChannelProductCardProps = {
  product: CatalogProduct;
};

export function ChannelProductCard({ product }: ChannelProductCardProps) {
  const imageUrl = getProductImageUrl(product.image);
  const price = getDisplayPrice(product);
  const href = `/catalog/${encodeURIComponent(product.id)}`;
  const categoryLabel = product.categories[0]?.name || product.conditions[0]?.name;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={href} className="block focus-visible:outline-none">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categoryLabel ? <Badge variant="secondary">{categoryLabel}</Badge> : null}
          {product.type ? <Badge variant="muted">{product.type}</Badge> : null}
        </div>
        <CardTitle className="text-lg">
          <Link href={href} className="hover:text-primary">
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {product.descriptionShort}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        {price ? (
          <p className="text-sm font-semibold text-foreground">
            Starting from {price}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Pricing shown after review</p>
        )}
        <div className="flex flex-col gap-2">
          <AddToCartButton product={product} className="w-full" />
          <Button asChild variant="outline" className="w-full">
            <Link href={href}>View details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
