"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import { formatUsdFromCents } from "@/features/storefront/data/treatments";
import { paymentService } from "@/lib/payments/payment-service";

const schema = z.object({
  addressLine1: z.string().min(3, "Enter a street address"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  postalCode: z.string().min(5, "Enter a ZIP code"),
  paymentMethodLabel: z.string().min(4, "Enter a payment method label"),
  consentAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept terms to continue",
  }),
});

type Values = z.infer<typeof schema>;

export function CheckoutFlow() {
  const router = useRouter();
  const { state, treatment, plan, updateCheckout, authorizeCheckout } =
    useJourney();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      addressLine1: state.checkout.addressLine1,
      addressLine2: state.checkout.addressLine2,
      city: state.checkout.city,
      state: state.checkout.state,
      postalCode: state.checkout.postalCode,
      paymentMethodLabel: "Card ending in 4242 (demo)",
      consentAccepted: false,
    },
  });

  if (!treatment || !plan) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Select a plan first</h1>
        <Button onClick={() => router.push("/plan")}>Choose plan</Button>
      </div>
    );
  }

  async function onSubmit(values: Values) {
    if (!plan) return;

    updateCheckout({
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 ?? "",
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      paymentMethodLabel: values.paymentMethodLabel,
      consentAccepted: true,
    });

    const intent = await paymentService.createPending(plan.priceCents, {
      label: values.paymentMethodLabel,
      paymentMethodRef: "pm_demo_token",
    });
    await paymentService.authorize(intent.id);
    authorizeCheckout();
    router.push("/intake");
  }

  return (
    <div className="space-y-6">
      <FlowStepper current="checkout" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Payment is authorized through PaymentService. Capture or release may
          happen later after provider review, depending on AsterMD configuration.
        </p>
      </div>

      <div className="border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground">Order summary</h2>
        <p className="mt-2 text-sm text-muted-foreground">{treatment.name}</p>
        <p className="text-sm text-muted-foreground">{plan.name}</p>
        <p className="mt-3 text-xl font-semibold text-foreground">
          {formatUsdFromCents(plan.priceCents)}/mo
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">
            Shipping address
          </legend>
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input id="addressLine1" {...register("addressLine1")} />
            {errors.addressLine1 ? (
              <p className="text-sm text-destructive">
                {errors.addressLine1.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Apartment / suite (optional)</Label>
            <Input id="addressLine2" {...register("addressLine2")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">ZIP</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">
            Payment method
          </legend>
          <div className="space-y-2">
            <Label htmlFor="paymentMethodLabel">
              Saved method label (demo)
            </Label>
            <Input id="paymentMethodLabel" {...register("paymentMethodLabel")} />
            <p className="text-xs text-muted-foreground">
              Do not enter real card numbers. This field is a placeholder for a
              tokenized payment method reference.
            </p>
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--primary)]"
            {...register("consentAccepted")}
          />
          <span>
            I agree to Medora’s terms and understand that treatment and
            prescriptions are not guaranteed.
          </span>
        </label>
        {errors.consentAccepted ? (
          <p className="text-sm text-destructive">
            {errors.consentAccepted.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Authorizing…" : "Continue to Medical Intake"}
        </Button>
      </form>
    </div>
  );
}
