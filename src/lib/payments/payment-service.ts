import type { PaymentState } from "@/lib/domain/types";

export type PaymentMethodInput = {
  label: string;
  /** Tokenized reference only — never persist raw PAN in app state. */
  paymentMethodRef: string;
};

export type PaymentIntent = {
  id: string;
  state: PaymentState;
  amountCents: number;
  methodLabel: string;
  updatedAt: string;
};

/**
 * Payment abstraction for authorize → (later capture/release) flows.
 * No Stripe-specific coupling. AsterMD/payment provider wiring comes later.
 */
export interface PaymentService {
  createPending(amountCents: number, method: PaymentMethodInput): Promise<PaymentIntent>;
  authorize(intentId: string): Promise<PaymentIntent>;
  capture(intentId: string): Promise<PaymentIntent>;
  release(intentId: string): Promise<PaymentIntent>;
  fail(intentId: string): Promise<PaymentIntent>;
  getIntent(intentId: string): Promise<PaymentIntent | null>;
}

const intents = new Map<string, PaymentIntent>();

export class MockPaymentService implements PaymentService {
  async createPending(
    amountCents: number,
    method: PaymentMethodInput,
  ): Promise<PaymentIntent> {
    await delay(200);
    const intent: PaymentIntent = {
      id: `pay_${crypto.randomUUID().slice(0, 8)}`,
      state: "pending",
      amountCents,
      methodLabel: method.label,
      updatedAt: new Date().toISOString(),
    };
    intents.set(intent.id, intent);
    return intent;
  }

  async authorize(intentId: string): Promise<PaymentIntent> {
    return this.update(intentId, "authorized");
  }

  async capture(intentId: string): Promise<PaymentIntent> {
    return this.update(intentId, "paid");
  }

  async release(intentId: string): Promise<PaymentIntent> {
    return this.update(intentId, "refunded");
  }

  async fail(intentId: string): Promise<PaymentIntent> {
    return this.update(intentId, "failed");
  }

  async getIntent(intentId: string): Promise<PaymentIntent | null> {
    return intents.get(intentId) ?? null;
  }

  private async update(intentId: string, state: PaymentState): Promise<PaymentIntent> {
    await delay(150);
    const current = intents.get(intentId);
    if (!current) {
      throw new Error(`Payment intent ${intentId} not found`);
    }
    const next = { ...current, state, updatedAt: new Date().toISOString() };
    intents.set(intentId, next);
    return next;
  }
}

export const paymentService: PaymentService = new MockPaymentService();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
