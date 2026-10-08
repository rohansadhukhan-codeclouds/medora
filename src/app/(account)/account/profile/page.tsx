"use client";

import { useJourney } from "@/features/journey/context/journey-provider";

export default function AccountProfilePage() {
  const { state } = useJourney();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <Field label="Email" value={state.patient.email || "—"} />
        <Field label="Phone" value={state.patient.phone || "—"} />
        <Field label="First name" value={state.patient.firstName || "—"} />
        <Field label="Last name" value={state.patient.lastName || "—"} />
        <Field
          label="Date of birth"
          value={state.patient.dateOfBirth || "—"}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Profile data stays in session memory for this demo. Do not store PHI in
        localStorage.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
