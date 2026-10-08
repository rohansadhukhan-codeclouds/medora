"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/features/journey/context/journey-provider";
import { formatUsdFromCents } from "@/features/storefront/data/treatments";

export function AccountOverview() {
  const { state, treatment, plan } = useJourney();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A lightweight summary of your care journey — not a hospital dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          title="Current treatment status"
          body={
            treatment
              ? `${treatment.name} · ${state.treatmentStatus.replaceAll("_", " ")}`
              : "No active treatment yet"
          }
          href="/status"
          action="View status"
        />
        <SummaryCard
          title="Next refill"
          body={
            state.skipNextRefill
              ? "Next refill skipped"
              : state.subscriptionCancelled
                ? "Subscription cancelled"
                : "Managed under your refill cycle (demo)"
          }
          href="/account/subscription"
          action="Manage subscription"
        />
        <SummaryCard
          title="Next billing"
          body={
            plan
              ? `${formatUsdFromCents(plan.priceCents)} · ${plan.renewalLabel}`
              : "No plan selected"
          }
          href="/account/subscription"
          action="Billing details"
        />
        <SummaryCard
          title="Latest order"
          body={state.orderId ? `Order ${state.orderId}` : "No orders yet"}
          href="/account/orders"
          action="View orders"
        />
      </div>

      {(state.treatmentStatus === "more_information_required" ||
        state.verificationStatus === "retry_required") && (
        <div className="border border-warning/40 bg-warning-muted p-5">
          <h2 className="font-semibold text-foreground">Required action</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Additional information or verification is needed to continue.
          </p>
          <Button asChild className="mt-4">
            <Link href="/review">Continue</Link>
          </Button>
        </div>
      )}

      {!treatment ? (
        <Button asChild>
          <Link href="/treatments">Explore treatments</Link>
        </Button>
      ) : null}
    </div>
  );
}

function SummaryCard({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        {action}
      </Link>
    </div>
  );
}
