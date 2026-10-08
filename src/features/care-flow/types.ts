export type TreatmentId =
  | "weight-management"
  | "hair-loss"
  | "mens-health"
  | "general-wellness";

export type ProductId = "semaglutide" | "tirzepatide";

export type ProviderStatus =
  | "under_review"
  | "approved"
  | "more_info_required"
  | "not_approved";

export type ShipmentStatus =
  | "awaiting_approval"
  | "prescription_sent"
  | "pharmacy_processing"
  | "shipment_prepared"
  | "shipped"
  | "delivered";

export type TreatmentLifecycleStatus =
  | "not_started"
  | "pending_review"
  | "active"
  | "renewal_due"
  | "change_requested";

export type EligibilityResult = "eligible" | "unavailable_state" | "not_suitable";

export type QuestionOption = {
  value: string;
  label: string;
};

export type IntakeQuestionType = "text" | "textarea" | "select" | "radio" | "checkbox" | "number" | "date";

export type IntakeQuestion = {
  id: string;
  type: IntakeQuestionType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
  fullWidth?: boolean;
};

export type IntakeStepDefinition = {
  id: string;
  title: string;
  description: string;
  questions: IntakeQuestion[];
};

export type TreatmentCategory = {
  id: TreatmentId;
  name: string;
  description: string;
  available: boolean;
  icon: "scale" | "sparkles" | "heart" | "leaf";
};

export type ProductOption = {
  id: ProductId;
  treatmentId: TreatmentId;
  name: string;
  description: string;
  planLabel: string;
  priceLabel: string;
  dosageLabel: string;
};

export type MockPatient = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
};

export type MockOrder = {
  id: string;
  createdAt: string;
  treatmentId: TreatmentId | null;
  productId: ProductId | null;
  planLabel: string;
  priceLabel: string;
  dosageLabel: string;
  shippingSummary: string;
};

export type MockShipment = {
  status: ShipmentStatus;
  trackingNumber: string;
  expectedDelivery: string;
  pharmacyName: string;
};

export type MockActiveTreatment = {
  productName: string;
  status: TreatmentLifecycleStatus;
  startDate: string;
  cycleLabel: string;
  prescriptionStatus: string;
};

export type CareFlowState = {
  selectedTreatmentId: TreatmentId | null;
  selectedProductId: ProductId | null;
  eligibilityAnswers: Record<string, string>;
  eligibilityResult: EligibilityResult | null;
  intakeAnswers: Record<string, string | string[]>;
  patient: MockPatient;
  checkout: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    cardName: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
  };
  order: MockOrder | null;
  providerStatus: ProviderStatus;
  shipment: MockShipment;
  activeTreatment: MockActiveTreatment | null;
  providerMessage: string;
  moreInfoReply: string;
  moreInfoSubmitted: boolean;
  renewalAnswers: Record<string, string>;
  renewalSubmitted: boolean;
  swapProductId: ProductId | null;
  swapSubmitted: boolean;
};
