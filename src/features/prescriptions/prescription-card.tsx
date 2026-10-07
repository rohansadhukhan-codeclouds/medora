import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Prescription } from "@/lib/api/astermd/types";
import { formatDateTime } from "@/lib/utils/format";

const statusLabel = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

type PrescriptionCardProps = {
  prescription: Prescription;
};

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{prescription.medicationName}</CardTitle>
          <CardDescription>Provider: {prescription.providerName}</CardDescription>
        </div>
        <Badge variant={prescription.status === "active" ? "success" : "muted"}>
          {statusLabel[prescription.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-foreground">{prescription.instructions}</p>
        <p className="text-muted-foreground">
          Last updated {formatDateTime(prescription.lastUpdatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}
