/**
 * Checkout shipping address shape.
 * Field names align with common Places / address-component mappings
 * so a future autocomplete PI can call `applyCheckoutAddress` without
 * reshaping the form.
 */
export type CheckoutAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const EMPTY_CHECKOUT_ADDRESS: CheckoutAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

/** Merge a Places (or manual) parse into the current address. */
export function applyCheckoutAddress(
  current: CheckoutAddress,
  patch: Partial<CheckoutAddress>,
): CheckoutAddress {
  return {
    line1: patch.line1 ?? current.line1,
    line2: patch.line2 ?? current.line2,
    city: patch.city ?? current.city,
    state: patch.state ?? current.state,
    postalCode: patch.postalCode ?? current.postalCode,
    country: patch.country ?? current.country,
  };
}
