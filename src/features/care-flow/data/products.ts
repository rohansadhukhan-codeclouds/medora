import type { ProductOption } from "@/features/care-flow/types";

/** Mock catalog only — not real clinical recommendations or pricing. */
export const WEIGHT_MANAGEMENT_PRODUCTS: ProductOption[] = [
  {
    id: "semaglutide",
    treatmentId: "weight-management",
    name: "Semaglutide",
    description:
      "A monthly plan option that may be considered after licensed provider review.",
    planLabel: "Monthly plan",
    priceLabel: "Starting from $XXX",
    dosageLabel: "Dosage determined by provider",
  },
  {
    id: "tirzepatide",
    treatmentId: "weight-management",
    name: "Tirzepatide",
    description:
      "An alternative monthly plan option, subject to clinical appropriateness.",
    planLabel: "Monthly plan",
    priceLabel: "Starting from $XXX",
    dosageLabel: "Dosage determined by provider",
  },
];

export function getProductById(id: string | null) {
  return WEIGHT_MANAGEMENT_PRODUCTS.find((item) => item.id === id) ?? null;
}
