import { AppointmentCard } from "@/features/appointments/appointment-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Appointment } from "@/lib/api/astermd/types";

type AppointmentHistoryProps = {
  appointments: Appointment[];
};

export function AppointmentHistory({ appointments }: AppointmentHistoryProps) {
  const history = appointments.filter(
    (item) => item.status === "completed" || item.status === "cancelled",
  );

  if (history.length === 0) {
    return (
      <EmptyState
        title="No appointment history"
        description="Completed and cancelled visits will appear here."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {history.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
