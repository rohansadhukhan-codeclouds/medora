"use client";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryCard } from "@/features/catalog/components/category-card";
import { ChannelProductGrid } from "@/features/catalog/components/channel-product-grid";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/features/catalog/lib/product-utils";
import { useChannel } from "@/hooks/use-channel";

export function CategoriesPageView() {
  const { products: channelProducts, channel } = useChannel();
  const products = getCatalogProducts(channelProducts);
  const categories = getCatalogCategories(products);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-16 sm:px-6">
      <PageHeader
        title="Categories"
        description={
          channel?.name
            ? `Browse products available on ${channel.name}.`
            : "Browse products by category from your care channel."
        }
      />

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Shop by category</h2>
        {categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No categories yet. Products will group here automatically.
          </p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">All products</h2>
        <ChannelProductGrid products={products} />
      </section>
    </div>
  );
}
