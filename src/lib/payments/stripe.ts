import "server-only";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeSecretKey(): string | undefined {
  return getServerEnv().STRIPE_API_KEY;
}

export function getStripePublishableKey(): string | undefined {
  return getServerEnv().STRIPE_PUBLISHABLE_KEY;
}

export function getStripe(): Stripe {
  const secret = getStripeSecretKey();
  if (!secret) {
    throw new Error("Stripe is not configured on the server.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secret);
  }
  return stripeClient;
}

export function toPlainJson(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}
