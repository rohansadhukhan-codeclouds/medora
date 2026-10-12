"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { LiveBreadcrumb } from "@/components/shared/live-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import {
  findCatalogProduct,
  formatProductPrice,
  getDisplayPrice,
  getProductImageUrl,
} from "@/features/catalog/lib/product-utils";
import { useChannel } from "@/hooks/use-channel";

type ProductDetailViewProps = {
  productId: string;
};

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const { products, isLoading, isReady, error, refetch } = useChannel();
  const product = findCatalogProduct(products, productId);

  if (isLoading && !isReady) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 sm:px-6" aria-busy="true">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 sm:px-6">
        <LiveBreadcrumb currentLabel="Product not found" />
        <EmptyState
          title="Product not found"
          description={
            error ||
            "This product is not available in the current channel catalog."
          }
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  const imageUrl = getProductImageUrl(product.image);
  const price = getDisplayPrice(product);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-16 sm:px-6">
      <LiveBreadcrumb currentLabel={product.name} />

      <PageHeader
        title={product.name}
        description={product.descriptionShort}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) =>
              category.name ? (
                <Badge key={`${category._id}-${category.name}`} variant="secondary">
                  {category.name}
                </Badge>
              ) : null,
            )}
            {product.type ? <Badge variant="muted">{product.type}</Badge> : null}
          </div>

          {price ? (
            <p className="text-2xl font-semibold text-foreground">
              Starting from {price}
            </p>
          ) : null}

          {product.descriptionLong ? (
            <p className="text-base leading-relaxed text-muted-foreground">
              {product.descriptionLong}
            </p>
          ) : null}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {product.sku ? (
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
            ) : null}
            {typeof product.stock === "number" ? (
              <div>
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="font-medium">{product.stock}</dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-wrap gap-3">
            <AddToCartButton product={product} />
          </div>

          <p className="text-xs text-muted-foreground">
            Product information is provided by your care channel. Final treatment
            decisions are made by a licensed healthcare provider.
          </p>
        </div>
      </div>

      {product.variants.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Available variants</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.variants.map((variant) => (
              <Card key={variant._id || variant.sku || variant.name}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {variant.name || "Variant"}
                  </CardTitle>
                  {variant.description ? (
                    <CardDescription>{variant.description}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="text-sm">
                  {formatProductPrice(variant.sale_price) ||
                  formatProductPrice(variant.intro_price) ||
                  formatProductPrice(variant.default_price) ? (
                    <p className="font-medium">
                      {formatProductPrice(variant.sale_price) ||
                        formatProductPrice(variant.intro_price) ||
                        formatProductPrice(variant.default_price)}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Price on request</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
