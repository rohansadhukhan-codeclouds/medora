"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoStatusPanel } from "@/features/care-flow/components/demo-status-panel";
import { FlowProgress } from "@/features/care-flow/components/flow-progress";
import { MoreInfoForm } from "@/features/care-flow/components/more-info-form";
import { OrderStatusTimeline } from "@/features/care-flow/components/order-status-timeline";
import { ShipmentTracker } from "@/features/care-flow/components/shipment-tracker";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";

const STATUS_LABELS = {
  under_review: "Under Provider Review",
  approved: "Approved",
  more_info_required: "More Information Required",
  not_approved: "Not Approved",
} as const;

export function OrderPageView() {
  const { state, selectedProduct, selectedTreatment } = useCareFlow();

  if (!state.order) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No order yet</CardTitle>
          <CardDescription>
            Place an order from checkout to view provider review status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/checkout">Go to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <FlowProgress current="review" />

      <Card>
        <CardHeader>
          <CardTitle>Your order has been received.</CardTitle>
          <CardDescription>
            Order {state.order.id}
            {selectedTreatment ? ` · ${selectedTreatment.name}` : null}
            {selectedProduct ? ` · ${selectedProduct.name}` : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge>{STATUS_LABELS[state.providerStatus]}</Badge>
          <p className="text-sm text-muted-foreground">
            A licensed provider reviews your intake before any prescription
            decision. Outcomes are never guaranteed.
          </p>
        </CardContent>
      </Card>

      <DemoStatusPanel />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusTimeline
              providerStatus={state.providerStatus}
              shipmentStatus={state.shipment.status}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {state.providerStatus === "under_review" ? (
              <p>
                Your medical intake is with a licensed provider. No action is
                needed unless more information is requested.
              </p>
            ) : null}
            {state.providerStatus === "approved" ? (
              <p>
                Your provider approved moving forward in this demo. Pharmacy and
                shipment details appear below.
              </p>
            ) : null}
            {state.providerStatus === "not_approved" ? (
              <p>
                Based on this demo decision, treatment was not approved. In a
                real workflow, next steps would be communicated by your care
                team.
              </p>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/portal">Open patient portal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {state.providerStatus === "more_info_required" ? <MoreInfoForm /> : null}

      {state.providerStatus === "approved" ? (
        <ShipmentTracker shipment={state.shipment} />
      ) : null}
    </div>
  );
}
