import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileView } from "@/features/patient/profile-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Profile",
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      }
    >
      <ProfileView />
    </Suspense>
  );
}
