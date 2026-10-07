import { CalendarDays, UserRound } from "lucide-react";
import { AppointmentStatusBadge } from "@/features/appointments/appointment-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Appointment } from "@/lib/api/astermd/types";
import { formatDateTime } from "@/lib/utils/format";

type AppointmentCardProps = {
  appointment: Appointment;
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{appointment.type}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(appointment.scheduledAt)}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span>{appointment.providerName}</span>
        </div>
        {appointment.notes ? (
          <div className="flex items-start gap-2 text-muted-foreground">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{appointment.notes}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
