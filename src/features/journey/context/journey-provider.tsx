"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getPlanById,
  getTreatmentById,
  getTreatmentBySlug,
} from "@/features/storefront/data/treatments";
import type { JourneyState } from "@/features/journey/types";
import type {
  JourneyStage,
  PaymentState,
  TreatmentStatus,
  VerificationStatus,
} from "@/lib/domain/types";

const initialState: JourneyState = {
  stage: "DISCOVERING",
  treatmentId: null,
  treatmentSlug: null,
  planId: null,
  eligibilityAnswers: {},
  eligibilityStatus: null,
  accountCreated: false,
  patient: {
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
  },
  checkout: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethodLabel: "",
    consentAccepted: false,
  },
  paymentState: "pending",
  paymentIntentId: null,
  intakeAnswers: {},
  intakeSubmitted: false,
  verificationStatus: "not_started",
  verificationSessionId: null,
  treatmentStatus: "intake_submitted",
  providerMessage:
    "A licensed provider may request additional details before completing review.",
  moreInfoReply: "",
  moreInfoSubmitted: false,
  orderId: null,
  trackingNumber: null,
  subscriptionPaused: false,
  subscriptionCancelled: false,
  skipNextRefill: false,
};

type JourneyContextValue = {
  state: JourneyState;
  treatment: ReturnType<typeof getTreatmentById> | null;
  plan: ReturnType<typeof getPlanById> | null;
  selectTreatment: (slug: string) => void;
  setEligibilityAnswer: (id: string, value: string) => void;
  completeEligibility: (
    status: NonNullable<JourneyState["eligibilityStatus"]>,
  ) => void;
  createAccount: (input: {
    email: string;
    phone: string;
  }) => void;
  selectPlan: (planId: string) => void;
  updateCheckout: (patch: Partial<JourneyState["checkout"]>) => void;
  updatePatient: (patch: Partial<JourneyState["patient"]>) => void;
  authorizeCheckout: () => void;
  setIntakeAnswer: (id: string, value: string | string[]) => void;
  submitIntake: () => void;
  setVerificationStatus: (status: VerificationStatus, sessionId?: string) => void;
  setTreatmentStatus: (status: TreatmentStatus) => void;
  setStage: (stage: JourneyStage) => void;
  setPaymentState: (state: PaymentState) => void;
  setMoreInfoReply: (value: string) => void;
  submitMoreInfo: () => void;
  pauseSubscription: () => void;
  cancelSubscription: () => void;
  skipRefill: () => void;
  resetJourney: () => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(initialState);

  const treatment = state.treatmentId
    ? (getTreatmentById(state.treatmentId) ?? null)
    : state.treatmentSlug
      ? (getTreatmentBySlug(state.treatmentSlug) ?? null)
      : null;
  const plan = state.planId ? (getPlanById(state.planId) ?? null) : null;

  const selectTreatment = useCallback((slug: string) => {
    const next = getTreatmentBySlug(slug);
    setState((prev) => ({
      ...prev,
      treatmentId: next?.id ?? null,
      treatmentSlug: slug,
      planId: null,
      stage: "TREATMENT_SELECTED",
      eligibilityStatus: null,
      eligibilityAnswers: {},
    }));
  }, []);

  const setEligibilityAnswer = useCallback((id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      stage: "ELIGIBILITY_IN_PROGRESS",
      eligibilityAnswers: { ...prev.eligibilityAnswers, [id]: value },
    }));
  }, []);

  const completeEligibility = useCallback(
    (status: NonNullable<JourneyState["eligibilityStatus"]>) => {
      setState((prev) => ({
        ...prev,
        eligibilityStatus: status,
        stage: status === "eligible" ? "ELIGIBLE" : "INELIGIBLE",
      }));
    },
    [],
  );

  const createAccount = useCallback((input: { email: string; phone: string }) => {
    setState((prev) => ({
      ...prev,
      accountCreated: true,
      patient: { ...prev.patient, email: input.email, phone: input.phone },
    }));
  }, []);

  const selectPlan = useCallback((planId: string) => {
    setState((prev) => ({
      ...prev,
      planId,
      stage: "PLAN_SELECTED",
    }));
  }, []);

  const updateCheckout = useCallback(
    (patch: Partial<JourneyState["checkout"]>) => {
      setState((prev) => ({
        ...prev,
        stage: "CHECKOUT_STARTED",
        checkout: { ...prev.checkout, ...patch },
      }));
    },
    [],
  );

  const updatePatient = useCallback(
    (patch: Partial<JourneyState["patient"]>) => {
      setState((prev) => ({
        ...prev,
        patient: { ...prev.patient, ...patch },
      }));
    },
    [],
  );

  const authorizeCheckout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      paymentState: "authorized",
      paymentIntentId: `pay_${crypto.randomUUID().slice(0, 8)}`,
      orderId: `ord_${crypto.randomUUID().slice(0, 8)}`,
      stage: "PAYMENT_PENDING",
      treatmentStatus: "intake_submitted",
    }));
  }, []);

  const setIntakeAnswer = useCallback(
    (id: string, value: string | string[]) => {
      setState((prev) => ({
        ...prev,
        stage: "INTAKE_IN_PROGRESS",
        intakeAnswers: { ...prev.intakeAnswers, [id]: value },
      }));
    },
    [],
  );

  const submitIntake = useCallback(() => {
    setState((prev) => ({
      ...prev,
      intakeSubmitted: true,
      stage: "INTAKE_SUBMITTED",
      treatmentStatus: "intake_submitted",
      patient: {
        ...prev.patient,
        firstName: String(prev.intakeAnswers.firstName ?? prev.patient.firstName),
        lastName: String(prev.intakeAnswers.lastName ?? prev.patient.lastName),
        dateOfBirth: String(
          prev.intakeAnswers.dateOfBirth ?? prev.patient.dateOfBirth,
        ),
      },
    }));
  }, []);

  const setVerificationStatus = useCallback(
    (status: VerificationStatus, sessionId?: string) => {
      setState((prev) => ({
        ...prev,
        verificationStatus: status,
        verificationSessionId: sessionId ?? prev.verificationSessionId,
        stage: "IDENTITY_VERIFICATION",
        treatmentStatus:
          status === "verified" ? "identity_verified" : prev.treatmentStatus,
      }));
    },
    [],
  );

  const setTreatmentStatus = useCallback((status: TreatmentStatus) => {
    setState((prev) => {
      const stageMap: Partial<Record<TreatmentStatus, JourneyStage>> = {
        provider_review: "PROVIDER_REVIEW",
        more_information_required: "MORE_INFO_REQUIRED",
        approved: "APPROVED",
        rejected: "REJECTED",
        prescription_created: "PRESCRIPTION_CREATED",
        sent_to_pharmacy: "PHARMACY_PROCESSING",
        pharmacy_processing: "PHARMACY_PROCESSING",
        shipped: "SHIPPED",
        delivered: "DELIVERED",
      };
      return {
        ...prev,
        treatmentStatus: status,
        stage: stageMap[status] ?? prev.stage,
        paymentState:
          status === "approved" || status === "prescription_created"
            ? "paid"
            : status === "rejected"
              ? "refunded"
              : prev.paymentState,
        trackingNumber:
          status === "shipped" || status === "delivered"
            ? prev.trackingNumber ?? "TRK-482910"
            : prev.trackingNumber,
      };
    });
  }, []);

  const setStage = useCallback((stage: JourneyStage) => {
    setState((prev) => ({ ...prev, stage }));
  }, []);

  const setPaymentState = useCallback((paymentState: PaymentState) => {
    setState((prev) => ({ ...prev, paymentState }));
  }, []);

  const setMoreInfoReply = useCallback((value: string) => {
    setState((prev) => ({ ...prev, moreInfoReply: value }));
  }, []);

  const submitMoreInfo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      moreInfoSubmitted: true,
      treatmentStatus: "provider_review",
      stage: "PROVIDER_REVIEW",
    }));
  }, []);

  const pauseSubscription = useCallback(() => {
    setState((prev) => ({ ...prev, subscriptionPaused: true }));
  }, []);

  const cancelSubscription = useCallback(() => {
    setState((prev) => ({
      ...prev,
      subscriptionCancelled: true,
      subscriptionPaused: false,
      stage: "CANCELLED",
    }));
  }, []);

  const skipRefill = useCallback(() => {
    setState((prev) => ({ ...prev, skipNextRefill: true }));
  }, []);

  const resetJourney = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      treatment,
      plan,
      selectTreatment,
      setEligibilityAnswer,
      completeEligibility,
      createAccount,
      selectPlan,
      updateCheckout,
      updatePatient,
      authorizeCheckout,
      setIntakeAnswer,
      submitIntake,
      setVerificationStatus,
      setTreatmentStatus,
      setStage,
      setPaymentState,
      setMoreInfoReply,
      submitMoreInfo,
      pauseSubscription,
      cancelSubscription,
      skipRefill,
      resetJourney,
    }),
    [
      state,
      treatment,
      plan,
      selectTreatment,
      setEligibilityAnswer,
      completeEligibility,
      createAccount,
      selectPlan,
      updateCheckout,
      updatePatient,
      authorizeCheckout,
      setIntakeAnswer,
      submitIntake,
      setVerificationStatus,
      setTreatmentStatus,
      setStage,
      setPaymentState,
      setMoreInfoReply,
      submitMoreInfo,
      pauseSubscription,
      cancelSubscription,
      skipRefill,
      resetJourney,
    ],
  );

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) {
    throw new Error("useJourney must be used within JourneyProvider");
  }
  return ctx;
}
