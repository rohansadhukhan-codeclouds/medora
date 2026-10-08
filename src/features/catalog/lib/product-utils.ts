import type {
  AsterMdChannelProduct,
  AsterMdChannelProductDetails,
  AsterMdNamedRef,
  AsterMdProductVariant,
} from "@/lib/api/astermd/channel-types";

export type CatalogProduct = {
  /** Stable route id (channel product row or nested product id) */
  id: string;
  channelProductId?: string;
  productId?: string;
  name: string;
  descriptionShort: string;
  descriptionLong: string;
  image?: string;
  sku?: string;
  type?: string;
  stock?: number;
  categories: AsterMdNamedRef[];
  conditions: AsterMdNamedRef[];
  variants: AsterMdProductVariant[];
  pricing: {
    defaultPrice: number | null;
    introPrice: number | null;
    salePrice: number | null;
  };
  raw: AsterMdChannelProduct;
};

const CDN_BASE =
  process.env.NEXT_PUBLIC_ASTERMD_CDN_URL?.replace(/\/+$/, "") ??
  "https://cdn.astermd.com";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductImageUrl(image?: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${CDN_BASE}/${image.replace(/^\/+/, "")}`;
}

/** AsterMD prices are typically stored in minor units (cents). */
export function formatProductPrice(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return null;
  }
  const dollars = amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

function resolvePricing(details?: AsterMdChannelProductDetails | null) {
  const variant = details?.variants?.[0];
  const single = details?.single?.[0];

  return {
    defaultPrice:
      variant?.default_price ?? single?.default_price ?? null,
    introPrice: variant?.intro_price ?? single?.intro_price ?? null,
    salePrice: variant?.sale_price ?? single?.sale_price ?? null,
  };
}

export function toCatalogProduct(
  item: AsterMdChannelProduct,
): CatalogProduct | null {
  const details = item.product;
  const id =
    details?._id ||
    details?.product_id ||
    item.product_id ||
    item._id;

  if (!id) return null;

  const name = details?.name?.trim();
  if (!name) return null;

  return {
    id,
    channelProductId: item._id,
    productId: item.product_id || details?.product_id || details?._id,
    name,
    descriptionShort:
      details?.description_short?.trim() ||
      details?.description_long?.trim() ||
      "Learn more about this treatment option.",
    descriptionLong:
      details?.description_long?.trim() ||
      details?.description_short?.trim() ||
      "",
    image: details?.image,
    sku: details?.sku,
    type: details?.type,
    stock: details?.stock,
    categories: details?.categories ?? [],
    conditions: details?.condition_treated ?? [],
    variants: details?.variants ?? [],
    pricing: resolvePricing(details),
    raw: item,
  };
}

const EMPTY_CATALOG_PRODUCTS: CatalogProduct[] = [];

export function getCatalogProducts(
  channelProducts: AsterMdChannelProduct[] | undefined | null,
): CatalogProduct[] {
  if (!channelProducts?.length) return EMPTY_CATALOG_PRODUCTS;
  return channelProducts
    .map(toCatalogProduct)
    .filter((item): item is CatalogProduct => Boolean(item));
}

export function findCatalogProduct(
  channelProducts: AsterMdChannelProduct[] | undefined | null,
  productId: string,
): CatalogProduct | null {
  return (
    getCatalogProducts(channelProducts).find(
      (item) =>
        item.id === productId ||
        item.productId === productId ||
        item.channelProductId === productId,
    ) ?? null
  );
}

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
};

export function getCatalogCategories(
  products: CatalogProduct[],
): CatalogCategory[] {
  const map = new Map<string, CatalogCategory>();

  for (const product of products) {
    const refs =
      product.categories.length > 0
        ? product.categories
        : product.conditions.length > 0
          ? product.conditions
          : [{ _id: "uncategorized", name: "General" }];

    for (const ref of refs) {
      const name = ref.name?.trim() || "General";
      const id = ref._id || slugify(name);
      const slug = slugify(name) || id;
      const existing = map.get(slug);
      if (existing) {
        existing.productCount += 1;
      } else {
        map.set(slug, { id, slug, name, productCount: 1 });
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getProductsForCategory(
  products: CatalogProduct[],
  categorySlug: string,
): CatalogProduct[] {
  return products.filter((product) => {
    const refs = [
      ...product.categories,
      ...product.conditions,
    ];
    if (refs.length === 0 && categorySlug === "general") {
      return true;
    }
    return refs.some((ref) => {
      const name = ref.name?.trim() || "General";
      return slugify(name) === categorySlug || ref._id === categorySlug;
    });
  });
}

export function getDisplayPrice(product: CatalogProduct): string | null {
  const { salePrice, introPrice, defaultPrice } = product.pricing;
  return (
    formatProductPrice(salePrice) ||
    formatProductPrice(introPrice) ||
    formatProductPrice(defaultPrice)
  );
}
