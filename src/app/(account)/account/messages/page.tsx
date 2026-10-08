"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/features/journey/context/journey-provider";

export default function AccountMessagesPage() {
  const { state } = useJourney();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Messages</h1>
      {state.treatmentStatus === "more_information_required" ? (
        <div className="border border-border bg-card p-5">
          <p className="font-medium text-foreground">
            Provider requested more information
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.providerMessage}
          </p>
          <Button asChild className="mt-4">
            <Link href="/review">Respond</Link>
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No care messages right now. Provider requests will appear here.
        </p>
      )}
    </div>
  );
}
