"use client";

import { useJourney } from "@/features/journey/context/journey-provider";

export default function AccountOrdersPage() {
  const { state, treatment } = useJourney();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      {state.orderId ? (
        <div className="border border-border bg-card p-5">
          <p className="font-medium text-foreground">{state.orderId}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {treatment?.name ?? "Treatment"} · {state.treatmentStatus.replaceAll("_", " ")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Payment: {state.paymentState}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tracking: {state.trackingNumber ?? "Pending"}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No orders yet. Complete checkout in the care journey to create one.
        </p>
      )}
    </div>
  );
}
