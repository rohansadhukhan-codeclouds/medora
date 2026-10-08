import type { Treatment, TreatmentPlan } from "@/lib/domain/types";

const disclaimer =
  "This information is for educational purposes and does not guarantee treatment, prescription, or specific outcomes. A licensed provider reviews your information and determines whether care is medically appropriate.";

export const STOREFRONT_TREATMENTS: Treatment[] = [
  {
    id: "trt_weight",
    slug: "weight-management",
    name: "Weight Management",
    category: "Weight Management",
    shortDescription:
      "Clinician-guided weight care with online assessment, provider review, and ongoing support when appropriate.",
    overview:
      "Medora’s weight management pathway helps you complete an online health assessment, connect with a licensed provider review workflow, and — if medically appropriate — coordinate treatment fulfillment through partner pharmacies.",
    included: [
      "Online health assessment",
      "Licensed provider review",
      "Treatment plan coordination if approved",
      "Fulfillment coordination",
      "Ongoing refill support for active enrollments",
    ],
    potentialBenefits: [
      "Convenient access from home",
      "Clear step-by-step care journey",
      "Support for recurring refill cycles when enrolled",
    ],
    howItWorks: [
      "Choose this treatment and check eligibility",
      "Select a subscription care plan and complete checkout",
      "Submit your medical intake and identity verification",
      "A licensed provider reviews your information",
      "If approved, treatment may be sent for pharmacy fulfillment",
    ],
    eligibilityOverview: [
      "Available in supported US states",
      "Adults 18+ only (preliminary screen)",
      "Final eligibility is determined by a licensed provider",
    ],
    faq: [
      {
        question: "Is a prescription guaranteed?",
        answer:
          "No. Prescriptions are never guaranteed. A licensed provider reviews your information and decides whether treatment is appropriate.",
      },
      {
        question: "How does billing work?",
        answer:
          "You select a subscription plan at checkout. Payment authorization, capture, or release may depend on later clinical and AsterMD payment configuration.",
      },
    ],
    disclaimer,
    startingPriceCents: 9900,
    subscriptionLabel: "Monthly subscription available",
    available: true,
  },
  {
    id: "trt_hair",
    slug: "hair-loss",
    name: "Hair Loss",
    category: "Hair Loss",
    shortDescription:
      "Confidential online assessment for hair loss with provider review when appropriate.",
    overview:
      "Start with a guided assessment. A licensed provider reviews your information before any treatment decisions.",
    included: [
      "Online assessment",
      "Provider review workflow",
      "Fulfillment coordination if approved",
    ],
    potentialBenefits: [
      "Private online intake",
      "Clear next steps after review",
    ],
    howItWorks: [
      "Check eligibility",
      "Choose a plan and complete intake",
      "Provider reviews your information",
      "Fulfillment if medically appropriate",
    ],
    eligibilityOverview: [
      "Adults 18+",
      "State availability may vary",
      "Provider determines final suitability",
    ],
    faq: [
      {
        question: "Will results be guaranteed?",
        answer:
          "No. Medora does not guarantee treatment outcomes or prescriptions.",
      },
    ],
    disclaimer,
    startingPriceCents: 4900,
    subscriptionLabel: "Monthly subscription available",
    available: true,
  },
  {
    id: "trt_mens",
    slug: "mens-health",
    name: "Men’s Health",
    category: "Men’s Health",
    shortDescription:
      "Discreet men’s health pathway with online intake and licensed provider review.",
    overview:
      "Complete a confidential assessment and move through a structured telehealth workflow designed for convenience and clinical oversight.",
    included: [
      "Confidential intake",
      "Provider review",
      "Treatment coordination if approved",
    ],
    potentialBenefits: [
      "Private experience",
      "Guided conversion funnel",
    ],
    howItWorks: [
      "Select treatment and confirm eligibility",
      "Subscribe to a care plan",
      "Complete intake and verification",
      "Await provider determination",
    ],
    eligibilityOverview: [
      "Adults 18+",
      "Supported states only",
      "Clinical review required",
    ],
    faq: [
      {
        question: "Is this emergency care?",
        answer:
          "No. Medora is not for emergencies. Call 911 for medical emergencies.",
      },
    ],
    disclaimer,
    startingPriceCents: 8900,
    subscriptionLabel: "Monthly subscription available",
    available: true,
  },
  {
    id: "trt_skin",
    slug: "skin-care",
    name: "Skin Care",
    category: "Skin Care",
    shortDescription:
      "Online dermatology-oriented pathway with assessment and provider review.",
    overview:
      "Share your concerns through an online assessment. A licensed provider reviews your information before any care decisions.",
    included: [
      "Photo-ready intake support (when configured)",
      "Provider review",
      "Fulfillment coordination if approved",
    ],
    potentialBenefits: [
      "Convenient access",
      "Structured follow-up when enrolled",
    ],
    howItWorks: [
      "Check eligibility",
      "Select a plan",
      "Complete medical intake",
      "Provider review and next steps",
    ],
    eligibilityOverview: [
      "Adults 18+",
      "Availability varies by state",
    ],
    faq: [
      {
        question: "Can I get instant approval?",
        answer:
          "No. Instant approval is not offered. Providers review submissions carefully.",
      },
    ],
    disclaimer,
    startingPriceCents: 5900,
    subscriptionLabel: "Monthly subscription available",
    available: true,
  },
];

export const STOREFRONT_PLANS: TreatmentPlan[] = [
  {
    id: "plan_weight_monthly",
    treatmentId: "trt_weight",
    name: "Monthly Care Plan",
    intervalMonths: 1,
    priceCents: 9900,
    renewalLabel: "Renews monthly",
    popular: true,
    includes: [
      "Online consultation workflow",
      "Provider review",
      "Treatment management",
      "Prescription if medically appropriate",
      "Fulfillment coordination",
      "Ongoing refill support",
    ],
  },
  {
    id: "plan_hair_monthly",
    treatmentId: "trt_hair",
    name: "Monthly Care Plan",
    intervalMonths: 1,
    priceCents: 4900,
    renewalLabel: "Renews monthly",
    popular: true,
    includes: [
      "Online consultation workflow",
      "Provider review",
      "Treatment management",
      "Fulfillment coordination",
      "Ongoing refill support",
    ],
  },
  {
    id: "plan_mens_monthly",
    treatmentId: "trt_mens",
    name: "Monthly Care Plan",
    intervalMonths: 1,
    priceCents: 8900,
    renewalLabel: "Renews monthly",
    popular: true,
    includes: [
      "Online consultation workflow",
      "Provider review",
      "Treatment management",
      "Fulfillment coordination",
      "Ongoing refill support",
    ],
  },
  {
    id: "plan_skin_monthly",
    treatmentId: "trt_skin",
    name: "Monthly Care Plan",
    intervalMonths: 1,
    priceCents: 5900,
    renewalLabel: "Renews monthly",
    popular: true,
    includes: [
      "Online consultation workflow",
      "Provider review",
      "Treatment management",
      "Fulfillment coordination",
      "Ongoing refill support",
    ],
  },
];

export function getTreatmentBySlug(slug: string): Treatment | undefined {
  return STOREFRONT_TREATMENTS.find((item) => item.slug === slug);
}

export function getTreatmentById(id: string): Treatment | undefined {
  return STOREFRONT_TREATMENTS.find((item) => item.id === id);
}

export function getPlansForTreatment(treatmentId: string): TreatmentPlan[] {
  return STOREFRONT_PLANS.filter((plan) => plan.treatmentId === treatmentId);
}

export function getPlanById(planId: string): TreatmentPlan | undefined {
  return STOREFRONT_PLANS.find((plan) => plan.id === planId);
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
