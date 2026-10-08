import type { TreatmentCategory } from "@/features/care-flow/types";

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    id: "weight-management",
    name: "Weight Management",
    description:
      "Online assessment and provider-guided options for weight management support.",
    available: true,
    icon: "scale",
  },
  {
    id: "hair-loss",
    name: "Hair Loss",
    description:
      "Explore hair loss care with a licensed provider review when appropriate.",
    available: false,
    icon: "sparkles",
  },
  {
    id: "mens-health",
    name: "Men's Health",
    description:
      "Confidential online intake for select men's health concerns.",
    available: false,
    icon: "heart",
  },
  {
    id: "general-wellness",
    name: "General Wellness",
    description:
      "General wellness check-ins and guidance through a virtual care journey.",
    available: false,
    icon: "leaf",
  },
];
