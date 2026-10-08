"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProductById } from "@/features/care-flow/data/products";
import { TREATMENT_CATEGORIES } from "@/features/care-flow/data/treatments";
import type {
  CareFlowState,
  EligibilityResult,
  ProductId,
  ProviderStatus,
  ShipmentStatus,
  TreatmentId,
} from "@/features/care-flow/types";

const initialState: CareFlowState = {
  selectedTreatmentId: null,
  selectedProductId: null,
  eligibilityAnswers: {},
  eligibilityResult: null,
  intakeAnswers: {},
  patient: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  },
  checkout: {
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  },
  order: null,
  providerStatus: "under_review",
  shipment: {
    status: "awaiting_approval",
    trackingNumber: "TRK-000000",
    expectedDelivery: "TBD",
    pharmacyName: "Partner Pharmacy (demo)",
  },
  activeTreatment: null,
  providerMessage:
    "Please provide additional information before we can complete your review.",
  moreInfoReply: "",
  moreInfoSubmitted: false,
  renewalAnswers: {},
  renewalSubmitted: false,
  swapProductId: null,
  swapSubmitted: false,
};

type CareFlowContextValue = {
  state: CareFlowState;
  selectedTreatment: (typeof TREATMENT_CATEGORIES)[number] | null;
  selectedProduct: ReturnType<typeof getProductById>;
  selectTreatment: (id: TreatmentId) => void;
  setEligibilityAnswer: (id: string, value: string) => void;
  setEligibilityResult: (result: EligibilityResult) => void;
  selectProduct: (id: ProductId) => void;
  setIntakeAnswer: (id: string, value: string | string[]) => void;
  updatePatientFromIntake: () => void;
  updateCheckout: (patch: Partial<CareFlowState["checkout"]> & Partial<CareFlowState["patient"]>) => void;
  placeOrder: () => void;
  setProviderStatus: (status: ProviderStatus) => void;
  setShipmentStatus: (status: ShipmentStatus) => void;
  setMoreInfoReply: (value: string) => void;
  submitMoreInfo: () => void;
  setRenewalAnswer: (id: string, value: string) => void;
  submitRenewal: () => void;
  setSwapProductId: (id: ProductId) => void;
  submitSwap: () => void;
  resetFlow: () => void;
};

const CareFlowContext = createContext<CareFlowContextValue | null>(null);

function shipmentForProviderStatus(status: ProviderStatus): Partial<CareFlowState["shipment"]> & {
  status: ShipmentStatus;
} {
  switch (status) {
    case "approved":
      return {
        status: "pharmacy_processing",
        trackingNumber: "TRK-482910",
        expectedDelivery: "Oct 14, 2026",
      };
    case "under_review":
    case "more_info_required":
    case "not_approved":
      return {
        status: "awaiting_approval",
        trackingNumber: "TRK-000000",
        expectedDelivery: "TBD",
      };
  }
}

export function CareFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CareFlowState>(initialState);

  const selectedTreatment =
    TREATMENT_CATEGORIES.find((item) => item.id === state.selectedTreatmentId) ??
    null;
  const selectedProduct = getProductById(state.selectedProductId);

  const selectTreatment = useCallback((id: TreatmentId) => {
    setState((prev) => ({
      ...prev,
      selectedTreatmentId: id,
      selectedProductId: null,
      eligibilityAnswers: {},
      eligibilityResult: null,
    }));
  }, []);

  const setEligibilityAnswer = useCallback((id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      eligibilityAnswers: { ...prev.eligibilityAnswers, [id]: value },
    }));
  }, []);

  const setEligibilityResult = useCallback((result: EligibilityResult) => {
    setState((prev) => ({ ...prev, eligibilityResult: result }));
  }, []);

  const selectProduct = useCallback((id: ProductId) => {
    setState((prev) => ({ ...prev, selectedProductId: id }));
  }, []);

  const setIntakeAnswer = useCallback((id: string, value: string | string[]) => {
    setState((prev) => ({
      ...prev,
      intakeAnswers: { ...prev.intakeAnswers, [id]: value },
    }));
  }, []);

  const updatePatientFromIntake = useCallback(() => {
    setState((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        firstName: String(prev.intakeAnswers.firstName ?? prev.patient.firstName),
        lastName: String(prev.intakeAnswers.lastName ?? prev.patient.lastName),
        dateOfBirth: String(
          prev.intakeAnswers.dateOfBirth ?? prev.patient.dateOfBirth,
        ),
        gender: String(prev.intakeAnswers.gender ?? prev.patient.gender),
      },
    }));
  }, []);

  const updateCheckout = useCallback(
    (
      patch: Partial<CareFlowState["checkout"]> &
        Partial<CareFlowState["patient"]>,
    ) => {
      setState((prev) => ({
        ...prev,
        patient: {
          ...prev.patient,
          email: patch.email ?? prev.patient.email,
          phone: patch.phone ?? prev.patient.phone,
          firstName: patch.firstName ?? prev.patient.firstName,
          lastName: patch.lastName ?? prev.patient.lastName,
        },
        checkout: {
          ...prev.checkout,
          addressLine1: patch.addressLine1 ?? prev.checkout.addressLine1,
          city: patch.city ?? prev.checkout.city,
          state: patch.state ?? prev.checkout.state,
          postalCode: patch.postalCode ?? prev.checkout.postalCode,
          cardName: patch.cardName ?? prev.checkout.cardName,
          cardNumber: patch.cardNumber ?? prev.checkout.cardNumber,
          cardExpiry: patch.cardExpiry ?? prev.checkout.cardExpiry,
          cardCvc: patch.cardCvc ?? prev.checkout.cardCvc,
        },
      }));
    },
    [],
  );

  const placeOrder = useCallback(() => {
    setState((prev) => {
      const product = getProductById(prev.selectedProductId);
      return {
        ...prev,
        providerStatus: "under_review",
        moreInfoSubmitted: false,
        order: {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          treatmentId: prev.selectedTreatmentId,
          productId: prev.selectedProductId,
          planLabel: product?.planLabel ?? "Monthly plan",
          priceLabel: product?.priceLabel ?? "Starting from $XXX",
          dosageLabel: product?.dosageLabel ?? "Provider determined",
          shippingSummary: `${prev.checkout.addressLine1}, ${prev.checkout.city}, ${prev.checkout.state} ${prev.checkout.postalCode}`,
        },
        shipment: {
          ...prev.shipment,
          status: "awaiting_approval",
          trackingNumber: "TRK-000000",
          expectedDelivery: "TBD",
        },
        activeTreatment: null,
      };
    });
  }, []);

  const setProviderStatus = useCallback((status: ProviderStatus) => {
    setState((prev) => {
      const product = getProductById(prev.selectedProductId);
      const shipmentPatch = shipmentForProviderStatus(status);
      return {
        ...prev,
        providerStatus: status,
        shipment: {
          ...prev.shipment,
          ...shipmentPatch,
        },
        activeTreatment:
          status === "approved"
            ? {
                productName: product?.name ?? "Selected product",
                status: "active",
                startDate: "Oct 7, 2026",
                cycleLabel: "2 of 3",
                prescriptionStatus: "Active",
              }
            : prev.activeTreatment,
      };
    });
  }, []);

  const setShipmentStatus = useCallback((status: ShipmentStatus) => {
    setState((prev) => ({
      ...prev,
      shipment: { ...prev.shipment, status },
    }));
  }, []);

  const setMoreInfoReply = useCallback((value: string) => {
    setState((prev) => ({ ...prev, moreInfoReply: value }));
  }, []);

  const submitMoreInfo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      moreInfoSubmitted: true,
      providerStatus: "under_review",
    }));
  }, []);

  const setRenewalAnswer = useCallback((id: string, value: string) => {
    setState((prev) => ({
      ...prev,
      renewalAnswers: { ...prev.renewalAnswers, [id]: value },
    }));
  }, []);

  const submitRenewal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      renewalSubmitted: true,
      providerStatus: "under_review",
      activeTreatment: prev.activeTreatment
        ? { ...prev.activeTreatment, status: "pending_review" }
        : prev.activeTreatment,
    }));
  }, []);

  const setSwapProductId = useCallback((id: ProductId) => {
    setState((prev) => ({ ...prev, swapProductId: id }));
  }, []);

  const submitSwap = useCallback(() => {
    setState((prev) => ({
      ...prev,
      swapSubmitted: true,
      providerStatus: "under_review",
      activeTreatment: prev.activeTreatment
        ? { ...prev.activeTreatment, status: "change_requested" }
        : prev.activeTreatment,
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo<CareFlowContextValue>(
    () => ({
      state,
      selectedTreatment,
      selectedProduct,
      selectTreatment,
      setEligibilityAnswer,
      setEligibilityResult,
      selectProduct,
      setIntakeAnswer,
      updatePatientFromIntake,
      updateCheckout,
      placeOrder,
      setProviderStatus,
      setShipmentStatus,
      setMoreInfoReply,
      submitMoreInfo,
      setRenewalAnswer,
      submitRenewal,
      setSwapProductId,
      submitSwap,
      resetFlow,
    }),
    [
      state,
      selectedTreatment,
      selectedProduct,
      selectTreatment,
      setEligibilityAnswer,
      setEligibilityResult,
      selectProduct,
      setIntakeAnswer,
      updatePatientFromIntake,
      updateCheckout,
      placeOrder,
      setProviderStatus,
      setShipmentStatus,
      setMoreInfoReply,
      submitMoreInfo,
      setRenewalAnswer,
      submitRenewal,
      setSwapProductId,
      submitSwap,
      resetFlow,
    ],
  );

  return (
    <CareFlowContext.Provider value={value}>{children}</CareFlowContext.Provider>
  );
}

export function useCareFlow() {
  const context = useContext(CareFlowContext);
  if (!context) {
    throw new Error("useCareFlow must be used within CareFlowProvider");
  }
  return context;
}
