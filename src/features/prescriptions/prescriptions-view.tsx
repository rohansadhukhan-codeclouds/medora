import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PrescriptionCard } from "@/features/prescriptions/prescription-card";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import type { Prescription } from "@/lib/api/astermd/types";
import { requirePatientSession } from "@/lib/security/auth";

async function loadPrescriptions(): Promise<
  { ok: true; data: Prescription[] } | { ok: false; message: string }
> {
  try {
    const patientId = await requirePatientSession();
    const data = await getAsterMdClient().getPrescriptions(patientId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: getUserFacingMessage(normalizeAsterMdError(error)),
    };
  }
}

export async function PrescriptionsView() {
  const result = await loadPrescriptions();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prescriptions" />
        <ErrorState message={result.message} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prescriptions"
        description="Only information received from the provider API is displayed. Medora never invents medication recommendations."
      />
      {result.data.length === 0 ? (
        <EmptyState
          title="No prescriptions yet"
          description="When your provider shares treatment information, it will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {result.data.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  );
}
