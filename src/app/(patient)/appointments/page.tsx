import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentsView } from "@/features/appointments/appointments-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Appointments",
  path: "/appointments",
  noIndex: true,
});

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsSkeleton />}>
      <AppointmentsView />
    </Suspense>
  );
}
