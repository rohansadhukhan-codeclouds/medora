import { cn } from "@/lib/utils/cn";

/**
 * AsterMD `properties.cols` in this storefront:
 * - cols === 1 (or missing) → full row in a 2-column grid
 * - cols === 2 → half row (pairable)
 *
 * Not Bootstrap 12-column. Centralized so field components stay layout-free.
 */
export function fieldColSpanClass(cols?: number, forceFullWidth?: boolean): string {
  if (forceFullWidth) return "col-span-1 sm:col-span-2";
  if (cols === 2) return "col-span-1";
  return "col-span-1 sm:col-span-2";
}

export function fieldLayoutClass(
  cols?: number,
  forceFullWidth?: boolean,
  className?: string,
): string {
  return cn(fieldColSpanClass(cols, forceFullWidth), className);
}
