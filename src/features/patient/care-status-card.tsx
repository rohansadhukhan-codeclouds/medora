import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CARE_STATUS_DESCRIPTIONS,
  CARE_STATUS_LABELS,
} from "@/lib/constants/care-status";
import type { CareStatus } from "@/lib/api/astermd/types";

const badgeVariantByStatus: Record<
  CareStatus,
  "muted" | "secondary" | "default" | "warning" | "success"
> = {
  intake_not_started: "muted",
  intake_in_progress: "secondary",
  submitted: "default",
  under_provider_review: "default",
  more_information_needed: "warning",
  completed: "success",
};

type CareStatusCardProps = {
  status: CareStatus;
};

export function CareStatusCard({ status }: CareStatusCardProps) {
  const showIntakeCta =
    status === "intake_not_started" ||
    status === "intake_in_progress" ||
    status === "more_information_needed";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>Care status</CardTitle>
          <Badge variant={badgeVariantByStatus[status]}>
            {CARE_STATUS_LABELS[status]}
          </Badge>
        </div>
        <CardDescription>{CARE_STATUS_DESCRIPTIONS[status]}</CardDescription>
      </CardHeader>
      {showIntakeCta ? (
        <CardContent>
          <Button asChild>
            <Link href="/intake">
              {status === "more_information_needed"
                ? "Provide more information"
                : "Continue intake"}
              <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
