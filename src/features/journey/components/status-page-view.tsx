"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TreatmentStatusStepper } from "@/features/journey/components/treatment-status-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";

export function StatusPageView() {
  const { state, treatment, plan } = useJourney();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Treatment status
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track provider review, pharmacy fulfillment, and shipment updates.
        </p>
      </div>

      <TreatmentStatusStepper current={state.treatmentStatus} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Enrollment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {treatment?.name ?? "No treatment selected"}
          </p>
          <p className="text-sm text-muted-foreground">
            {plan?.name ?? "No plan selected"}
          </p>
          <p className="mt-3 text-sm capitalize text-muted-foreground">
            Status: {state.treatmentStatus.replaceAll("_", " ")}
          </p>
        </div>
        <div className="border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Shipment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tracking: {state.trackingNumber ?? "Not available yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            Order: {state.orderId ?? "Pending"}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Payment: {state.paymentState}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/review">Open review controls</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account">Account overview</Link>
        </Button>
      </div>
    </div>
  );
}
