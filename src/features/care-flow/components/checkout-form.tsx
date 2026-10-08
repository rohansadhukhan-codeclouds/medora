"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlowProgress } from "@/features/care-flow/components/flow-progress";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";

export function CheckoutForm() {
  const router = useRouter();
  const {
    selectedTreatment,
    selectedProduct,
    state,
    updateCheckout,
    placeOrder,
  } = useCareFlow();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!selectedTreatment || !selectedProduct) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete earlier steps first</CardTitle>
          <CardDescription>
            Select a treatment and product before checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/treatments">Start over</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function validate(): boolean {
    const required: Record<string, string> = {
      email: state.patient.email,
      phone: state.patient.phone,
      addressLine1: state.checkout.addressLine1,
      city: state.checkout.city,
      state: state.checkout.state,
      postalCode: state.checkout.postalCode,
      cardName: state.checkout.cardName,
      cardNumber: state.checkout.cardNumber,
      cardExpiry: state.checkout.cardExpiry,
      cardCvc: state.checkout.cardCvc,
    };
    const nextErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(required)) {
      if (!value.trim()) nextErrors[key] = "Required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handlePlaceOrder() {
    if (!validate()) return;
    placeOrder();
    router.push("/order");
  }

  return (
    <div className="space-y-8">
      <FlowProgress current="checkout" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                id="email"
                label="Email"
                value={state.patient.email}
                error={errors.email}
                onChange={(value) => updateCheckout({ email: value })}
              />
              <Field
                id="phone"
                label="Phone"
                value={state.patient.phone}
                error={errors.phone}
                onChange={(value) => updateCheckout({ phone: value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                id="addressLine1"
                label="Street address"
                value={state.checkout.addressLine1}
                error={errors.addressLine1}
                className="sm:col-span-2"
                onChange={(value) => updateCheckout({ addressLine1: value })}
              />
              <Field
                id="city"
                label="City"
                value={state.checkout.city}
                error={errors.city}
                onChange={(value) => updateCheckout({ city: value })}
              />
              <Field
                id="state"
                label="State"
                value={state.checkout.state}
                error={errors.state}
                onChange={(value) => updateCheckout({ state: value })}
              />
              <Field
                id="postalCode"
                label="ZIP code"
                value={state.checkout.postalCode}
                error={errors.postalCode}
                onChange={(value) => updateCheckout({ postalCode: value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>
                Visual placeholder only — no payment gateway is connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                id="cardName"
                label="Name on card"
                value={state.checkout.cardName}
                error={errors.cardName}
                className="sm:col-span-2"
                onChange={(value) => updateCheckout({ cardName: value })}
              />
              <Field
                id="cardNumber"
                label="Card number"
                value={state.checkout.cardNumber}
                error={errors.cardNumber}
                placeholder="•••• •••• •••• ••••"
                className="sm:col-span-2"
                onChange={(value) => updateCheckout({ cardNumber: value })}
              />
              <Field
                id="cardExpiry"
                label="Expiry"
                value={state.checkout.cardExpiry}
                error={errors.cardExpiry}
                placeholder="MM/YY"
                onChange={(value) => updateCheckout({ cardExpiry: value })}
              />
              <Field
                id="cardCvc"
                label="CVC"
                value={state.checkout.cardCvc}
                error={errors.cardCvc}
                placeholder="123"
                onChange={(value) => updateCheckout({ cardCvc: value })}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <SummaryRow label="Treatment" value={selectedTreatment.name} />
            <SummaryRow label="Product" value={selectedProduct.name} />
            <SummaryRow label="Plan" value={selectedProduct.planLabel} />
            <SummaryRow label="Variant" value={selectedProduct.dosageLabel} />
            <SummaryRow label="Price" value={selectedProduct.priceLabel} />
            <Button type="button" className="w-full" onClick={handlePlaceOrder}>
              Place Order
            </Button>
            <p className="text-xs text-muted-foreground">
              Placing an order in this demo only updates frontend mock state.
              No payment is processed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
