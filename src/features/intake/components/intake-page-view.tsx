"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { extractCheckoutContact } from "@/features/checkout/extract-contact-from-teleform";
import { saveCheckoutContactDraft } from "@/features/checkout/intake-checkout-draft";
import { DynamicFormRenderer } from "@/features/intake/teleform/dynamic-form-renderer";
import { IntakeLoading } from "@/features/intake/teleform/intake-loading";
import type { TeleformValues } from "@/features/intake/teleform/types";

type TeleformBootstrapResponse = {
  ok: boolean;
  error?: string;
  formJson?: unknown;
};

const MIN_LOADER_MS = 1800;

function readFormName(formJson: unknown): string | null {
  if (!formJson || typeof formJson !== "object") return null;
  const name = (formJson as { formName?: unknown }).formName;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

export function IntakePageView() {
  const router = useRouter();
  const [percent, setPercent] = useState(6);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [formJson, setFormJson] = useState<unknown>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Avoid Date.now() during render — breaks Next.js prerender purity checks.
  const startedAt = useRef(0);

  const handleTeleformSubmit = (values: TeleformValues) => {
    const contact = extractCheckoutContact(values);
    saveCheckoutContactDraft(contact);
    router.push("/checkout");
  };

  useEffect(() => {
    let cancelled = false;
    startedAt.current = Date.now();

    tickRef.current = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 92) return prev;
        if (prev < 35) return prev + 2;
        if (prev < 70) return prev + 1.5;
        return prev + 0.6;
      });
    }, 160);

    void (async () => {
      try {
        const response = await fetch("/api/teleform", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as TeleformBootstrapResponse;

        if (cancelled) return;

        if (!response.ok || !payload.ok || !payload.formJson) {
          setStatus("error");
          setError(payload.error ?? "Failed to load teleform.");
          setPercent(100);
          return;
        }

        const elapsed = Date.now() - startedAt.current;
        const waitMore = Math.max(0, MIN_LOADER_MS - elapsed);
        if (waitMore > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMore));
        }
        if (cancelled) return;

        setPercent(100);
        setFormJson(payload.formJson);
        // Schema used to construct DynamicFormRenderer (not patient answers).
        console.log("[intake] teleform formJson", payload.formJson);
        await new Promise((resolve) => setTimeout(resolve, 280));
        if (cancelled) return;
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
        setError("Failed to load teleform.");
        setPercent(100);
      } finally {
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--secondary)_16%,transparent),_transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
        <Reveal trigger="mount">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to cart
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-muted text-primary">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">Medical intake</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {readFormName(formJson) || "Intake form"}
              </h1>
            </div>
          </div>
        </Reveal>

        <div className="mt-10">
          {status === "loading" ? (
            <IntakeLoading percent={percent} label="Fetching intake form" />
          ) : null}

          {status === "error" ? (
            <div
              className="rounded-2xl border border-destructive/20 bg-destructive-muted p-6 text-sm text-destructive"
              role="alert"
            >
              <p className="font-medium">Could not build intake form</p>
              <p className="mt-2">{error}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {status === "ready" && formJson ? (
            <Reveal trigger="mount">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <DynamicFormRenderer
                  formDefinition={formJson}
                  showFormTitle={false}
                  onSubmit={handleTeleformSubmit}
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
