import "server-only";
import type {
  EligibilityResult,
  Order,
  RefillCycle,
  Subscription,
  Treatment,
  TreatmentEnrollment,
  TreatmentPlan,
  TreatmentStatus,
} from "@/lib/domain/types";
import {
  STOREFRONT_PLANS,
  STOREFRONT_TREATMENTS,
  getTreatmentBySlug,
} from "@/features/storefront/data/treatments";

/**
 * Storefront-facing AsterMD contract extensions.
 * RealAsterMd methods stay TODO until official docs/endpoints exist.
 * Do NOT invent live API URLs here.
 */
export interface AsterMdStorefrontService {
  getTreatments(): Promise<Treatment[]>;
  getTreatment(slug: string): Promise<Treatment | null>;
  getTreatmentPlans(treatmentId: string): Promise<TreatmentPlan[]>;
  submitEligibility(input: {
    treatmentId: string;
    answers: Record<string, string>;
  }): Promise<EligibilityResult>;
  createOrder(input: {
    treatmentId: string;
    planId: string;
  }): Promise<Order>;
  getTreatmentStatus(orderId: string): Promise<TreatmentStatus>;
  getSubscription(patientId: string): Promise<Subscription | null>;
  updateSubscription(
    subscriptionId: string,
    patch: Partial<Subscription>,
  ): Promise<Subscription>;
  getRefillCycles(enrollmentId: string): Promise<RefillCycle[]>;
  getEnrollment(patientId: string): Promise<TreatmentEnrollment | null>;
  submitAdditionalInformation(input: {
    orderId: string;
    message: string;
  }): Promise<{ ok: true }>;
}

export class MockAsterMdStorefrontService implements AsterMdStorefrontService {
  async getTreatments() {
    return STOREFRONT_TREATMENTS;
  }

  async getTreatment(slug: string) {
    return getTreatmentBySlug(slug) ?? null;
  }

  async getTreatmentPlans(treatmentId: string) {
    return STOREFRONT_PLANS.filter((plan) => plan.treatmentId === treatmentId);
  }

  async submitEligibility(_input: {
    treatmentId: string;
    answers: Record<string, string>;
  }): Promise<EligibilityResult> {
    void _input;
    return { status: "eligible" };
  }

  async createOrder(_input: {
    treatmentId: string;
    planId: string;
  }): Promise<Order> {
    void _input;
    return {
      id: `ord_${crypto.randomUUID().slice(0, 8)}`,
      status: "intake_submitted",
      paymentState: "authorized",
      createdAt: new Date().toISOString(),
    };
  }

  async getTreatmentStatus(_orderId: string): Promise<TreatmentStatus> {
    void _orderId;
    return "provider_review";
  }

  async getSubscription(_patientId: string): Promise<Subscription | null> {
    void _patientId;
    return {
      id: "sub_demo",
      planId: STOREFRONT_PLANS[0]?.id ?? "plan_demo",
      status: "active",
      nextBillingDate: "2026-11-07",
      paymentMethodLabel: "Card ending in 4242",
      shippingSummary: "Demo address on file",
    };
  }

  async updateSubscription(
    subscriptionId: string,
    patch: Partial<Subscription>,
  ): Promise<Subscription> {
    const current = await this.getSubscription("pat_demo");
    return {
      ...(current ?? {
        id: subscriptionId,
        planId: "plan_demo",
        status: "active",
        nextBillingDate: null,
        paymentMethodLabel: "",
        shippingSummary: "",
      }),
      ...patch,
      id: subscriptionId,
    };
  }

  async getRefillCycles(enrollmentId: string): Promise<RefillCycle[]> {
    return [
      {
        id: "refill_1",
        enrollmentId,
        cycleNumber: 1,
        nextRefillDate: "2026-11-01",
        status: "upcoming",
      },
    ];
  }

  async getEnrollment(): Promise<TreatmentEnrollment | null> {
    return null;
  }

  async submitAdditionalInformation(): Promise<{ ok: true }> {
    return { ok: true };
  }
}

export class RealAsterMdStorefrontService implements AsterMdStorefrontService {
  async getTreatments(): Promise<Treatment[]> {
    // TODO(AsterMD): wire documented catalog/treatment endpoints when available.
    throw new Error("RealAsterMdStorefrontService.getTreatments is not implemented");
  }

  async getTreatment(): Promise<Treatment | null> {
    throw new Error("RealAsterMdStorefrontService.getTreatment is not implemented");
  }

  async getTreatmentPlans(): Promise<TreatmentPlan[]> {
    throw new Error(
      "RealAsterMdStorefrontService.getTreatmentPlans is not implemented",
    );
  }

  async submitEligibility(): Promise<EligibilityResult> {
    throw new Error(
      "RealAsterMdStorefrontService.submitEligibility is not implemented",
    );
  }

  async createOrder(): Promise<Order> {
    throw new Error("RealAsterMdStorefrontService.createOrder is not implemented");
  }

  async getTreatmentStatus(): Promise<TreatmentStatus> {
    throw new Error(
      "RealAsterMdStorefrontService.getTreatmentStatus is not implemented",
    );
  }

  async getSubscription(): Promise<Subscription | null> {
    throw new Error(
      "RealAsterMdStorefrontService.getSubscription is not implemented",
    );
  }

  async updateSubscription(): Promise<Subscription> {
    throw new Error(
      "RealAsterMdStorefrontService.updateSubscription is not implemented",
    );
  }

  async getRefillCycles(): Promise<RefillCycle[]> {
    throw new Error(
      "RealAsterMdStorefrontService.getRefillCycles is not implemented",
    );
  }

  async getEnrollment(): Promise<TreatmentEnrollment | null> {
    throw new Error(
      "RealAsterMdStorefrontService.getEnrollment is not implemented",
    );
  }

  async submitAdditionalInformation(): Promise<{ ok: true }> {
    throw new Error(
      "RealAsterMdStorefrontService.submitAdditionalInformation is not implemented",
    );
  }
}
