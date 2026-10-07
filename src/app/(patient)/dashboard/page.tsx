import { Suspense } from "react";
import { DashboardSkeleton } from "@/features/patient/dashboard-skeleton";
import { DashboardView } from "@/features/patient/dashboard-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Dashboard",
  description: "Your Medora Health patient dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
