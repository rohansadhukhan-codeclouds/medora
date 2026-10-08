import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockShipment, ShipmentStatus } from "@/features/care-flow/types";
import { cn } from "@/lib/utils/cn";

const STEPS: { id: ShipmentStatus; label: string }[] = [
  { id: "prescription_sent", label: "Provider Approved / Prescription Sent" },
  { id: "pharmacy_processing", label: "Pharmacy Processing" },
  { id: "shipment_prepared", label: "Shipment Prepared" },
  { id: "shipped", label: "Shipped" },
];

type ShipmentTrackerProps = {
  shipment: MockShipment;
};

export function ShipmentTracker({ shipment }: ShipmentTrackerProps) {
  const index = Math.max(
    0,
    STEPS.findIndex((step) => step.id === shipment.status),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>Pharmacy & shipment</CardTitle>
          <Badge variant="success">Approved pathway</Badge>
        </div>
        <CardDescription>
          Mock fulfillment details for demo purposes only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Pharmacy</dt>
            <dd className="font-medium">{shipment.pharmacyName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tracking number</dt>
            <dd className="font-medium">{shipment.trackingNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expected delivery</dt>
            <dd className="font-medium">{shipment.expectedDelivery}</dd>
          </div>
        </dl>
        <ol className="space-y-3">
          {STEPS.map((step, stepIndex) => (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                stepIndex <= index
                  ? "border-primary/30 bg-primary-muted text-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {step.label}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
