import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PrescriptionsView } from "@/features/prescriptions/prescriptions-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Prescriptions",
  path: "/prescriptions",
  noIndex: true,
});

export default function PrescriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      }
    >
      <PrescriptionsView />
    </Suspense>
  );
}
