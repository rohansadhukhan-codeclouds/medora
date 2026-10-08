import type { TreatmentStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

const STEPS: TreatmentStatus[] = [
  "intake_submitted",
  "identity_verified",
  "provider_review",
  "approved",
  "prescription_created",
  "sent_to_pharmacy",
  "pharmacy_processing",
  "shipped",
  "delivered",
];

export function TreatmentStatusStepper({
  current,
}: {
  current: TreatmentStatus;
}) {
  const index = STEPS.indexOf(
    current === "more_information_required" || current === "rejected"
      ? "provider_review"
      : current,
  );

  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {STEPS.map((step, stepIndex) => {
        const active = step === current;
        const complete = index >= 0 && stepIndex <= index;
        return (
          <li
            key={step}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs",
              active && "border-primary bg-primary-muted text-primary",
              complete && !active && "border-border bg-card text-foreground",
              !complete &&
                !active &&
                "border-border/60 text-muted-foreground",
            )}
          >
            {step.replaceAll("_", " ")}
          </li>
        );
      })}
    </ol>
  );
}
