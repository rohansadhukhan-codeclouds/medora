"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

const PRODUCT_IMAGE_PLACEHOLDER = "/images/product-placeholder.svg";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Wrapper classes when fill is used (parent must be position:relative). */
  wrapperClassName?: string;
};

/**
 * Catalog image with graceful fallback.
 * AsterMD CDN may return 403 (private/hotlink-protected), so we skip the
 * Next image optimizer for remote URLs and swap to a local placeholder on error.
 */
export function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  priority = false,
  wrapperClassName,
}: ProductImageProps) {
  const resolvedSrc = src?.trim() || PRODUCT_IMAGE_PLACEHOLDER;
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(src?.trim() || PRODUCT_IMAGE_PLACEHOLDER);
  }, [src]);

  const isRemote =
    currentSrc.startsWith("http://") || currentSrc.startsWith("https://");
  const isPlaceholder = currentSrc === PRODUCT_IMAGE_PLACEHOLDER;

  const image = (
    <Image
      key={currentSrc}
      src={currentSrc}
      alt={isPlaceholder ? "Product image unavailable" : alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      unoptimized={isRemote || isPlaceholder}
      className={cn(
        fill ? "object-cover" : undefined,
        isPlaceholder ? "object-contain p-4" : undefined,
        className,
      )}
      onError={() => {
        if (currentSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
          setCurrentSrc(PRODUCT_IMAGE_PLACEHOLDER);
        }
      }}
    />
  );

  if (fill) {
    return (
      <div className={cn("relative h-full w-full bg-muted", wrapperClassName)}>
        {image}
      </div>
    );
  }

  return image;
}
