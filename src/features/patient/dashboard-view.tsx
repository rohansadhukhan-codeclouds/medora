import Link from "next/link";
import {
  ClipboardList,
  FileText,
  MessageSquare,
  Pill,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CareStatusCard } from "@/features/patient/care-status-card";
import { UpcomingAppointment } from "@/features/appointments/upcoming-appointment";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import type { PatientDashboard } from "@/lib/api/astermd/types";
import { requirePatientSession } from "@/lib/security/auth";
import { formatDateTime, formatPatientName } from "@/lib/utils/format";

async function loadDashboard(): Promise<
  { ok: true; data: PatientDashboard } | { ok: false; message: string }
> {
  try {
    const patientId = await requirePatientSession();
    const data = await getAsterMdClient().getPatientDashboard(patientId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: getUserFacingMessage(normalizeAsterMdError(error)),
    };
  }
}

export async function DashboardView() {
  const result = await loadDashboard();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Your care overview will appear here once available."
        />
        <ErrorState message={result.message} />
        <EmptyState
          title="Unable to load dashboard data"
          description="Please try again in a moment."
        />
      </div>
    );
  }

  const { patient, upcomingAppointment, prescriptions, conversations, documents } =
    result.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${patient.firstName}`}
        description="Track your care status, appointments, messages, and treatment information in one place."
        actions={
          <Button asChild variant="outline">
            <Link href="/profile">View profile</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CareStatusCard status={patient.careStatus} />
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Upcoming appointment
          </h2>
          <UpcomingAppointment appointment={upcomingAppointment} />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" aria-hidden="true" />
              Treatment overview
            </CardTitle>
            <CardDescription>
              Information shown here comes from provider APIs only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prescriptions[0] ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">
                  {prescriptions[0].medicationName}
                </p>
                <p className="text-muted-foreground">
                  Status: {prescriptions[0].status}
                </p>
                <Button asChild variant="link" className="h-auto px-0">
                  <Link href="/prescriptions">View prescriptions</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No treatment information available yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
              Messages
            </CardTitle>
            <CardDescription>Recent conversations with your care team.</CardDescription>
          </CardHeader>
          <CardContent>
            {conversations[0] ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{conversations[0].subject}</p>
                <p className="line-clamp-2 text-muted-foreground">
                  {conversations[0].lastMessagePreview}
                </p>
                <Button asChild variant="link" className="h-auto px-0">
                  <Link href="/messages">Open messages</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              Documents
            </CardTitle>
            <CardDescription>Intake summaries and acknowledgements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="text-sm">
                  <p className="font-medium text-foreground">{doc.title}</p>
                  <p className="text-muted-foreground">
                    {doc.type} · {formatDateTime(doc.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/intake">
              <ClipboardList />
              Continue intake
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/appointments">Appointments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/messages">Messages</Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile snapshot</CardTitle>
          <CardDescription>
            {formatPatientName(patient.firstName, patient.lastName)} · {patient.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">Manage profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
