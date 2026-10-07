import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { AppointmentCard } from "@/features/appointments/appointment-card";
import { AppointmentHistory } from "@/features/appointments/appointment-history";
import { EmptyState } from "@/components/shared/empty-state";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import type { Appointment } from "@/lib/api/astermd/types";
import { requirePatientSession } from "@/lib/security/auth";

async function loadAppointments(): Promise<
  { ok: true; data: Appointment[] } | { ok: false; message: string }
> {
  try {
    const patientId = await requirePatientSession();
    const data = await getAsterMdClient().getAppointments(patientId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: getUserFacingMessage(normalizeAsterMdError(error)),
    };
  }
}

export async function AppointmentsView() {
  const result = await loadAppointments();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader title="Appointments" />
        <ErrorState message={result.message} />
      </div>
    );
  }

  const upcoming = result.data.filter(
    (item) => item.status === "scheduled" || item.status === "requested",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Appointments"
        description="Upcoming visits and history from your care partner."
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming appointments"
            description="Requested or scheduled visits will appear here."
          />
        ) : (
          <div className="grid gap-4">
            {upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">History</h2>
        <AppointmentHistory appointments={result.data} />
      </section>
    </div>
  );
}
