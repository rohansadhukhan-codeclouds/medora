"use client";

import { Button } from "@/components/ui/button";
import { useJourney } from "@/features/journey/context/journey-provider";
import { formatUsdFromCents } from "@/features/storefront/data/treatments";

export function SubscriptionManagement() {
  const {
    state,
    treatment,
    plan,
    pauseSubscription,
    cancelSubscription,
    skipRefill,
    updateCheckout,
  } = useJourney();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Commercial subscription, treatment enrollment, and refill cycles are
          modeled separately. Actions below call mock service handlers only.
        </p>
      </div>

      <div className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <Field label="Plan" value={plan?.name ?? "—"} />
        <Field
          label="Status"
          value={
            state.subscriptionCancelled
              ? "Cancelled"
              : state.subscriptionPaused
                ? "Paused"
                : "Active"
          }
        />
        <Field
          label="Next billing date"
          value={plan ? "Demo · next cycle" : "—"}
        />
        <Field
          label="Next refill date"
          value={state.skipNextRefill ? "Skipped" : "Demo · upcoming"}
        />
        <Field
          label="Payment method"
          value={state.checkout.paymentMethodLabel || "Not set"}
        />
        <Field
          label="Shipping address"
          value={
            state.checkout.addressLine1
              ? `${state.checkout.addressLine1}, ${state.checkout.city}`
              : "Not set"
          }
        />
        <Field label="Treatment" value={treatment?.name ?? "—"} />
        <Field
          label="Price"
          value={plan ? `${formatUsdFromCents(plan.priceCents)}/mo` : "—"}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            updateCheckout({
              paymentMethodLabel: "Updated card ending in 1111 (demo)",
            })
          }
        >
          Update payment method
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            updateCheckout({
              addressLine1: "123 Updated Ave",
              city: state.checkout.city || "Austin",
              state: state.checkout.state || "TX",
              postalCode: state.checkout.postalCode || "78701",
            })
          }
        >
          Update shipping address
        </Button>
        <Button type="button" variant="outline" onClick={pauseSubscription}>
          Pause
        </Button>
        <Button type="button" variant="outline" onClick={skipRefill}>
          Skip next refill
        </Button>
        <Button type="button" variant="destructive" onClick={cancelSubscription}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
