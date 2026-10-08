"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { TreatmentStatusStepper } from "@/features/journey/components/treatment-status-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import type { TreatmentStatus } from "@/lib/domain/types";

const DEMO_STATUSES: TreatmentStatus[] = [
  "provider_review",
  "more_information_required",
  "approved",
  "rejected",
  "prescription_created",
  "sent_to_pharmacy",
  "pharmacy_processing",
  "shipped",
  "delivered",
];

export function ReviewStatusFlow() {
  const router = useRouter();
  const {
    state,
    treatment,
    setTreatmentStatus,
    setMoreInfoReply,
    submitMoreInfo,
  } = useJourney();

  if (state.verificationStatus !== "verified" && !state.intakeSubmitted) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Complete verification first</h1>
        <Button onClick={() => router.push("/verification")}>
          Go to verification
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FlowStepper current="review" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Provider review & treatment status
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The frontend only displays status. It never makes clinical decisions.
          {treatment ? ` Pathway: ${treatment.name}.` : null}
        </p>
      </div>

      <TreatmentStatusStepper current={state.treatmentStatus} />

      <div className="border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground">Current status</h2>
        <p className="mt-2 text-sm capitalize text-muted-foreground">
          {state.treatmentStatus.replaceAll("_", " ")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Payment state: {state.paymentState}
        </p>
      </div>

      {state.treatmentStatus === "more_information_required" ? (
        <div className="space-y-3 border border-warning/30 bg-warning-muted p-5">
          <h2 className="font-semibold text-foreground">
            More information required
          </h2>
          <p className="text-sm text-muted-foreground">
            {state.providerMessage}
          </p>
          <div className="space-y-2">
            <Label htmlFor="moreInfo">Your response</Label>
            <Textarea
              id="moreInfo"
              value={state.moreInfoReply}
              onChange={(event) => setMoreInfoReply(event.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={!state.moreInfoReply.trim()}
            onClick={() => {
              submitMoreInfo();
            }}
          >
            Resubmit for review
          </Button>
        </div>
      ) : null}

      {state.treatmentStatus === "rejected" ? (
        <div className="space-y-3 border border-destructive/30 bg-destructive-muted p-5">
          <h2 className="font-semibold text-foreground">
            Treatment not approved
          </h2>
          <p className="text-sm text-muted-foreground">
            A provider was unable to approve this treatment based on the
            information provided.
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>· Payment status: {state.paymentState} (demo release/refund)</li>
            <li>· Contact support if you need help with next steps</li>
            <li>· Alternative care guidance can be configured later</li>
          </ul>
        </div>
      ) : null}

      {state.treatmentStatus === "approved" ||
      state.treatmentStatus === "prescription_created" ||
      state.treatmentStatus === "sent_to_pharmacy" ||
      state.treatmentStatus === "pharmacy_processing" ||
      state.treatmentStatus === "shipped" ||
      state.treatmentStatus === "delivered" ? (
        <div className="space-y-3 border border-success/30 bg-success-muted p-5">
          <h2 className="font-semibold text-foreground">Treatment approved</h2>
          <p className="text-sm text-muted-foreground">
            A provider has completed the review. Fulfillment status updates
            appear below as the journey continues.
          </p>
          {state.trackingNumber ? (
            <p className="text-sm text-muted-foreground">
              Tracking: {state.trackingNumber}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Demo status controls
        </h2>
        <div className="flex flex-wrap gap-2">
          {DEMO_STATUSES.map((status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={
                state.treatmentStatus === status ? "default" : "outline"
              }
              onClick={() => setTreatmentStatus(status)}
            >
              {status.replaceAll("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <Button type="button" variant="outline" onClick={() => router.push("/status")}>
        Open full status page
      </Button>
      <Button type="button" onClick={() => router.push("/account")}>
        Go to account
      </Button>
    </div>
  );
}
