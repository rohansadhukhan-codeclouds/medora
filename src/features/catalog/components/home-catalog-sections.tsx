"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/features/catalog/components/category-card";
import { ChannelProductGrid } from "@/features/catalog/components/channel-product-grid";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/features/catalog/lib/product-utils";
import { useChannel } from "@/hooks/use-channel";

export function HomeCatalogSections() {
  const { products: channelProducts, channel } = useChannel();
  const products = getCatalogProducts(channelProducts);
  const categories = getCatalogCategories(products);

  return (
    <>
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="Categories"
            title="Browse care by category"
            description={
              channel?.name
                ? `Live options from ${channel.name}. Availability depends on clinical review.`
                : "Explore treatment categories available through your care channel."
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.length > 0
              ? categories.slice(0, 4).map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))
              : null}
          </div>
          {categories.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Categories will appear when channel products are available.
            </p>
          ) : null}
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/categories">View all categories</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="Products"
          title="Featured treatment options"
          description="Product details come from your AsterMD channel catalog. Selecting a product opens full details."
        />
        <div className="mt-10">
          <ChannelProductGrid products={products} limit={6} />
        </div>
        <div className="mt-8">
          <Button asChild>
            <Link href="/categories">Browse full catalog</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
