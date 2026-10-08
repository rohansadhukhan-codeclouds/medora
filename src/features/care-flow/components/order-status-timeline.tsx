import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProviderStatus, ShipmentStatus } from "@/features/care-flow/types";

const BASE_STEPS = [
  "Order Received",
  "Medical Intake Submitted",
  "Provider Review",
  "Prescription Decision",
  "Pharmacy",
  "Shipment",
] as const;

function activeIndex(
  providerStatus: ProviderStatus,
  shipmentStatus: ShipmentStatus,
): number {
  if (providerStatus === "under_review" || providerStatus === "more_info_required") {
    return 2;
  }
  if (providerStatus === "not_approved") {
    return 3;
  }
  if (providerStatus === "approved") {
    if (shipmentStatus === "shipped" || shipmentStatus === "delivered") return 5;
    if (
      shipmentStatus === "pharmacy_processing" ||
      shipmentStatus === "shipment_prepared" ||
      shipmentStatus === "prescription_sent"
    ) {
      return 4;
    }
    return 3;
  }
  return 1;
}

type OrderStatusTimelineProps = {
  providerStatus: ProviderStatus;
  shipmentStatus: ShipmentStatus;
};

export function OrderStatusTimeline({
  providerStatus,
  shipmentStatus,
}: OrderStatusTimelineProps) {
  const current = activeIndex(providerStatus, shipmentStatus);

  return (
    <ol className="space-y-4">
      {BASE_STEPS.map((label, index) => {
        const complete = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                complete && "bg-success text-success-foreground",
                active && "bg-primary text-primary-foreground",
                !complete && !active && "bg-muted text-muted-foreground",
              )}
            >
              {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </p>
              {active ? (
                <p className="text-xs text-muted-foreground">Current step</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
