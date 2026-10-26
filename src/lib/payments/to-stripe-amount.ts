/**
 * Convert a storefront price into Stripe minor units (cents).
 *
 * Decimal values like `0.6` or `19.99` are dollar amounts from the frontend.
 * Whole numbers (e.g. `19900`) stay as cents.
 */
export function toStripeAmountCents(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  if (!Number.isInteger(amount)) {
    return Math.round(amount * 100);
  }
  return Math.round(amount);
}
