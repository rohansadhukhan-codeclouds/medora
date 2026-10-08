"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
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

export function PortalDashboard() {
  const { state, selectedProduct, selectedTreatment } = useCareFlow();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Patient portal"
        description="Track your treatment, orders, messages, and renewals in one place."
        actions={
          <Button asChild variant="outline">
            <Link href="/order">View order status</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current treatment</CardTitle>
            <CardDescription>
              {state.activeTreatment?.productName ??
                selectedProduct?.name ??
                "No active treatment yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={state.activeTreatment ? "success" : "muted"}>
              {state.activeTreatment?.status ?? "Not started"}
            </Badge>
            <Button asChild variant="link" className="h-auto px-0">
              <Link href="/portal/treatments">View treatment details</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current order status</CardTitle>
            <CardDescription>
              {state.order?.id ?? "No order placed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {selectedTreatment?.name ?? "Treatment not selected"}
            </p>
            <Badge>{state.providerStatus.replaceAll("_", " ")}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next renewal</CardTitle>
            <CardDescription>
              {state.activeTreatment ? "Due soon (demo)" : "Available after activation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/portal/renewal">Start renewal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages</CardTitle>
            <CardDescription>
              {state.providerStatus === "more_info_required"
                ? "Provider requested more information"
                : "No unread messages"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="h-auto px-0">
              <Link href="/portal/messages">Open messages</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipment status</CardTitle>
            <CardDescription>{state.shipment.status.replaceAll("_", " ")}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tracking: {state.shipment.trackingNumber}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
