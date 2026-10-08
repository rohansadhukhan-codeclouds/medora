import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  STOREFRONT_TREATMENTS,
  formatUsdFromCents,
} from "@/features/storefront/data/treatments";

export function TreatmentsListing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <PageHeader
        title="Treatments"
        description="Explore subscription-based telehealth pathways. Selecting a treatment starts a guided eligibility and care journey — not an instant cart checkout."
      />

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {STOREFRONT_TREATMENTS.map((treatment) => (
          <article
            key={treatment.id}
            className="flex flex-col border border-border bg-card p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              {treatment.category}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {treatment.name}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {treatment.shortDescription}
            </p>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  From {formatUsdFromCents(treatment.startingPriceCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {treatment.subscriptionLabel}
                </p>
              </div>
              <Button asChild>
                <Link href={`/treatments/${treatment.slug}`}>
                  {treatment.available ? "View Treatment" : "Coming soon"}
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
