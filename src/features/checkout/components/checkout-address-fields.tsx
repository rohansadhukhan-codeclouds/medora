"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyCheckoutAddress,
  type CheckoutAddress,
} from "@/features/checkout/checkout-address";

type Props = {
  value: CheckoutAddress;
  onChange: (next: CheckoutAddress) => void;
};

/**
 * Editable shipping fields. `line1` is the autocomplete host —
 * attach Places (or another address PI) to `#checkout-address-line1`
 * and call `onChange(applyCheckoutAddress(...))` on place select.
 */
export function CheckoutAddressFields({ value, onChange }: Props) {
  const patch = (partial: Partial<CheckoutAddress>) => {
    onChange(applyCheckoutAddress(value, partial));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="checkout-address-line1">Street address</Label>
        <Input
          id="checkout-address-line1"
          name="address-line1"
          autoComplete="street-address"
          placeholder="Start typing your address"
          value={value.line1}
          onChange={(event) => patch({ line1: event.target.value })}
          data-address-autocomplete="line1"
        />
        <p className="text-xs text-muted-foreground">
          Address suggestions will appear here once Places is connected.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-address-line2">
          Apt, suite, etc.{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="checkout-address-line2"
          name="address-line2"
          autoComplete="address-line2"
          value={value.line2}
          onChange={(event) => patch({ line2: event.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="checkout-address-city">City</Label>
          <Input
            id="checkout-address-city"
            name="city"
            autoComplete="address-level2"
            value={value.city}
            onChange={(event) => patch({ city: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-address-state">State</Label>
          <Input
            id="checkout-address-state"
            name="state"
            autoComplete="address-level1"
            value={value.state}
            onChange={(event) => patch({ state: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-address-postal">ZIP code</Label>
          <Input
            id="checkout-address-postal"
            name="postal-code"
            autoComplete="postal-code"
            inputMode="numeric"
            value={value.postalCode}
            onChange={(event) => patch({ postalCode: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-address-country">Country</Label>
          <Input
            id="checkout-address-country"
            name="country"
            autoComplete="country"
            value={value.country}
            onChange={(event) => patch({ country: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
