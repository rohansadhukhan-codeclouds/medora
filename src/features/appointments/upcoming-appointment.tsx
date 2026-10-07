import Link from "next/link";
import { AppointmentCard } from "@/features/appointments/appointment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/api/astermd/types";

type UpcomingAppointmentProps = {
  appointment: Appointment | null;
};

export function UpcomingAppointment({ appointment }: UpcomingAppointmentProps) {
  if (!appointment) {
    return (
      <EmptyState
        title="No upcoming appointments"
        description="When a visit is scheduled, it will appear here."
        action={
          <Button asChild variant="outline">
            <Link href="/appointments">View appointments</Link>
          </Button>
        }
      />
    );
  }

  return <AppointmentCard appointment={appointment} />;
}
