import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeChannelProducts } from "@/features/catalog/components/home-channel-products";

/**
 * Lean storefront home: hero + AsterMD channel products from Zustand.
 */
export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-muted),transparent_45%),linear-gradient(180deg,var(--background),#eef3f6)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Medora Health
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Healthcare that fits your life.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Browse treatments from your care channel. A licensed provider reviews
            your information before any treatment decisions.
          </p>
          <div>
            <Button asChild size="lg">
              <Link href="#products">View products</Link>
            </Button>
          </div>
        </div>
      </section>

      <HomeChannelProducts />
    </>
  );
}
