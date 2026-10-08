"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ChannelProductGrid } from "@/features/catalog/components/channel-product-grid";
import {
  getCatalogCategories,
  getCatalogProducts,
  getProductsForCategory,
} from "@/features/catalog/lib/product-utils";
import { useChannel } from "@/hooks/use-channel";

type CategoryDetailViewProps = {
  categorySlug: string;
};

export function CategoryDetailView({ categorySlug }: CategoryDetailViewProps) {
  const { products: channelProducts } = useChannel();
  const products = getCatalogProducts(channelProducts);
  const categories = getCatalogCategories(products);
  const category =
    categories.find((item) => item.slug === categorySlug) ??
    categories.find((item) => item.id === categorySlug);
  const filtered = getProductsForCategory(products, categorySlug);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-16 sm:px-6">
      <PageHeader
        title={category?.name ?? "Category"}
        description={
          category
            ? `${filtered.length} product${filtered.length === 1 ? "" : "s"} in this category.`
            : "Products matching this category."
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/categories">All categories</Link>
          </Button>
        }
      />
      <ChannelProductGrid
        products={filtered}
        emptyTitle="No products in this category"
        emptyDescription="Try another category or browse the full catalog."
      />
    </div>
  );
}
