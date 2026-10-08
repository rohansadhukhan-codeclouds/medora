"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";
import type { ProviderStatus, ShipmentStatus } from "@/features/care-flow/types";

const PROVIDER_OPTIONS: { value: ProviderStatus; label: string }[] = [
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "more_info_required", label: "More Information Required" },
  { value: "not_approved", label: "Not Approved" },
];

const SHIPMENT_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: "prescription_sent", label: "Prescription Sent" },
  { value: "pharmacy_processing", label: "Pharmacy Processing" },
  { value: "shipment_prepared", label: "Shipment Prepared" },
  { value: "shipped", label: "Shipped" },
];

export function DemoStatusPanel() {
  const { state, setProviderStatus, setShipmentStatus } = useCareFlow();

  return (
    <Card className="border-warning/40 bg-warning-muted">
      <CardHeader>
        <CardTitle className="text-base">Development Demo Only</CardTitle>
        <CardDescription>
          Temporary controls to preview frontend provider and shipment states.
          Remove before production.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PROVIDER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={
                state.providerStatus === option.value ? "default" : "outline"
              }
              onClick={() => setProviderStatus(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {state.providerStatus === "approved" ? (
          <div className="flex flex-wrap gap-2">
            {SHIPMENT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={
                  state.shipment.status === option.value ? "secondary" : "outline"
                }
                onClick={() => setShipmentStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
