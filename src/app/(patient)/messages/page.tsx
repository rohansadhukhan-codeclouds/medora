import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagesView } from "@/features/messaging/messages-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Messages",
  path: "/messages",
  noIndex: true,
});

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      }
    >
      <MessagesView />
    </Suspense>
  );
}
