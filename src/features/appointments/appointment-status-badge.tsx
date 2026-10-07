import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/lib/api/astermd/types";

const labels: Record<AppointmentStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const variants: Record<
  AppointmentStatus,
  "secondary" | "default" | "success" | "muted"
> = {
  requested: "secondary",
  scheduled: "default",
  completed: "success",
  cancelled: "muted",
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
