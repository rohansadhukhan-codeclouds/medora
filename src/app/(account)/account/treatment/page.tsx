"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TreatmentStatusStepper } from "@/features/journey/components/treatment-status-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";

export default function AccountTreatmentPage() {
  const { state, treatment, plan } = useJourney();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My treatment</h1>
      <p className="text-sm text-muted-foreground">
        {treatment?.name ?? "No treatment enrollment yet"}
        {plan ? ` · ${plan.name}` : ""}
      </p>
      <TreatmentStatusStepper current={state.treatmentStatus} />
      <Button asChild>
        <Link href="/status">Open full status</Link>
      </Button>
    </div>
  );
}
