"use client";

import { SectionHeading } from "@/components/shared/section-heading";
import { ChannelProductGrid } from "@/features/catalog/components/channel-product-grid";
import { getCatalogProducts } from "@/features/catalog/lib/product-utils";
import { useChannel } from "@/hooks/use-channel";

/**
 * Renders channel products from global Zustand (hydrated via /api/astermd/channel).
 */
export function HomeChannelProducts() {
  const { products: channelProducts, channel } = useChannel();
  const products = getCatalogProducts(channelProducts);

  return (
    <section id="products" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
      <SectionHeading
        eyebrow="Products"
        title={channel?.name ? `${channel.name} treatments` : "Available treatments"}
        description="Products load from your AsterMD channel after a secure server-side token exchange. Select a product to view details."
      />
      <div className="mt-10">
        <ChannelProductGrid products={products} />
      </div>
    </section>
  );
}
