"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";

export function ActiveTreatmentView() {
  const { state, selectedProduct } = useCareFlow();
  const treatment = state.activeTreatment;

  if (!treatment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treatments"
          description="Active treatment details appear after provider approval."
        />
        <EmptyState
          title="No active treatment yet"
          description="Complete the care journey and use the demo panel to mark the order as Approved."
          action={
            <Button asChild>
              <Link href="/order">Go to order status</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Active treatment"
        description="Product, cycle, and prescription details from mock care state."
        actions={
          <Button asChild variant="outline">
            <Link href="/portal/swap">Change Treatment</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{treatment.productName}</CardTitle>
            <Badge variant="success">{treatment.status}</Badge>
          </div>
          <CardDescription>
            {selectedProduct?.planLabel ?? "Monthly plan"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Detail label="Treatment start date" value={treatment.startDate} />
          <Detail label="Current cycle" value={treatment.cycleLabel} />
          <Detail
            label="Prescription status"
            value={treatment.prescriptionStatus}
          />
          <Detail
            label="Shipment history"
            value={`${state.shipment.status.replaceAll("_", " ")} · ${state.shipment.trackingNumber}`}
          />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Treatment changes require provider approval.
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
