"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelProductCard } from "@/features/catalog/components/channel-product-card";
import type { CatalogProduct } from "@/features/catalog/lib/product-utils";
import { useChannel } from "@/hooks/use-channel";

type ChannelProductGridProps = {
  products: CatalogProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
  limit?: number;
};

export function ChannelProductGrid({
  products,
  emptyTitle = "No products available",
  emptyDescription = "Products will appear here once your channel catalog is configured.",
  limit,
}: ChannelProductGridProps) {
  const { isLoading, error, refetch, isReady } = useChannel();
  const visible = typeof limit === "number" ? products.slice(0, limit) : products;

  if (isLoading && !isReady) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-border p-4">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !isReady) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Refresh catalog
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((product) => (
        <ChannelProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
