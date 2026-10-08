/**
 * Storefront-first domain models.
 * Wire shapes for AsterMD will be mapped later — do not invent API payloads here.
 */

export type PaymentState =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type JourneyStage =
  | "DISCOVERING"
  | "TREATMENT_SELECTED"
  | "ELIGIBILITY_IN_PROGRESS"
  | "ELIGIBLE"
  | "INELIGIBLE"
  | "PLAN_SELECTED"
  | "CHECKOUT_STARTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "INTAKE_IN_PROGRESS"
  | "INTAKE_SUBMITTED"
  | "IDENTITY_VERIFICATION"
  | "PROVIDER_REVIEW"
  | "MORE_INFO_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "PRESCRIPTION_CREATED"
  | "PHARMACY_PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "REFILL_DUE"
  | "REFILL_REVIEW"
  | "RENEWED"
  | "CANCELLED";

export type TreatmentStatus =
  | "intake_submitted"
  | "identity_verified"
  | "provider_review"
  | "more_information_required"
  | "approved"
  | "rejected"
  | "prescription_created"
  | "sent_to_pharmacy"
  | "pharmacy_processing"
  | "shipped"
  | "delivered";

export type VerificationStatus =
  | "not_started"
  | "in_progress"
  | "verified"
  | "failed"
  | "retry_required";

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "past_due"
  | "cancelled"
  | "trialing";

export type Treatment = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  overview: string;
  included: string[];
  potentialBenefits: string[];
  howItWorks: string[];
  eligibilityOverview: string[];
  faq: Array<{ question: string; answer: string }>;
  disclaimer: string;
  startingPriceCents: number;
  subscriptionLabel: string;
  available: boolean;
};

export type TreatmentPlan = {
  id: string;
  treatmentId: string;
  name: string;
  intervalMonths: 1 | 3 | 6;
  priceCents: number;
  renewalLabel: string;
  includes: string[];
  popular?: boolean;
};

export type EligibilityResult = {
  status: "eligible" | "ineligible" | "unavailable_state";
  reasons?: string[];
};

export type Subscription = {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  nextBillingDate: string | null;
  paymentMethodLabel: string;
  shippingSummary: string;
};

export type TreatmentEnrollment = {
  id: string;
  treatmentId: string;
  planId: string;
  status: TreatmentStatus;
  startedAt: string;
};

export type RefillCycle = {
  id: string;
  enrollmentId: string;
  cycleNumber: number;
  nextRefillDate: string | null;
  status: "upcoming" | "due" | "in_review" | "fulfilled" | "skipped";
};

export type IntakeSubmission = {
  id: string;
  status: "draft" | "submitted" | "under_review";
  answers: Record<string, string | string[]>;
  submittedAt: string | null;
};

export type ProviderReview = {
  status: TreatmentStatus;
  message?: string;
  updatedAt: string;
};

export type Prescription = {
  id: string;
  status: "created" | "sent_to_pharmacy" | "cancelled";
  label: string;
};

export type Order = {
  id: string;
  status: TreatmentStatus;
  paymentState: PaymentState;
  createdAt: string;
};

export type Shipment = {
  id: string;
  status:
    | "prescription_ready"
    | "sent_to_pharmacy"
    | "processing"
    | "packed"
    | "shipped"
    | "delivered";
  trackingNumber: string | null;
  carrier: string | null;
  expectedDelivery: string | null;
  pharmacyName: string | null;
};

export type Patient = {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
};
