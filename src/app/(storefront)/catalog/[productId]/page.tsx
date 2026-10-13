import { ProductDetailView } from "@/features/catalog/components/product-detail-view";
import { buildMetadata } from "@/config/metadata";

export const instant = false;

type PageProps = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { productId } = await params;
  return buildMetadata({
    title: "Product details",
    description: "View treatment product details from your Medora channel.",
    path: `/catalog/${productId}`,
  });
}

export default async function CatalogProductPage({ params }: PageProps) {
  const { productId } = await params;
  return <ProductDetailView productId={decodeURIComponent(productId)} />;
}
