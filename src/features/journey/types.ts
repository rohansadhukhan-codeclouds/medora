import type {
  JourneyStage,
  PaymentState,
  TreatmentStatus,
  VerificationStatus,
} from "@/lib/domain/types";

export type JourneyCheckout = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  paymentMethodLabel: string;
  consentAccepted: boolean;
};

export type JourneyPatient = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

export type JourneyState = {
  stage: JourneyStage;
  treatmentId: string | null;
  treatmentSlug: string | null;
  planId: string | null;
  eligibilityAnswers: Record<string, string>;
  eligibilityStatus: "eligible" | "ineligible" | "unavailable_state" | null;
  accountCreated: boolean;
  patient: JourneyPatient;
  checkout: JourneyCheckout;
  paymentState: PaymentState;
  paymentIntentId: string | null;
  intakeAnswers: Record<string, string | string[]>;
  intakeSubmitted: boolean;
  verificationStatus: VerificationStatus;
  verificationSessionId: string | null;
  treatmentStatus: TreatmentStatus;
  providerMessage: string;
  moreInfoReply: string;
  moreInfoSubmitted: boolean;
  orderId: string | null;
  trackingNumber: string | null;
  subscriptionPaused: boolean;
  subscriptionCancelled: boolean;
  skipNextRefill: boolean;
};
