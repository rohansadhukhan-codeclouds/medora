import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import type { Patient } from "@/lib/api/astermd/types";
import { CARE_STATUS_LABELS } from "@/lib/constants/care-status";
import { requirePatientSession } from "@/lib/security/auth";
import { formatDate, formatPatientName } from "@/lib/utils/format";

async function loadPatient(): Promise<
  { ok: true; data: Patient } | { ok: false; message: string }
> {
  try {
    const patientId = await requirePatientSession();
    const data = await getAsterMdClient().getPatient(patientId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: getUserFacingMessage(normalizeAsterMdError(error)),
    };
  }
}

export async function ProfileView() {
  const result = await loadPatient();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" />
        <ErrorState message={result.message} />
      </div>
    );
  }

  const patient = result.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Your account details. Avoid placing sensitive identifiers in URLs."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {formatPatientName(patient.firstName, patient.lastName)}
          </CardTitle>
          <CardDescription>{patient.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ProfileField label="Phone" value={patient.phone ?? "—"} />
          <ProfileField
            label="Date of birth"
            value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "—"}
          />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Care status</p>
            <Badge>{CARE_STATUS_LABELS[patient.careStatus]}</Badge>
          </div>
          <ProfileField label="Patient ID" value={patient.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
