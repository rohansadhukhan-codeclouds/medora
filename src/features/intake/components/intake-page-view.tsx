"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { extractCheckoutContact } from "@/features/checkout/extract-contact-from-teleform";
import { saveCheckoutContactDraft } from "@/features/checkout/intake-checkout-draft";
import {
  DynamicFormRenderer,
  type TeleformStepAdvanceInfo,
} from "@/features/intake/teleform/dynamic-form-renderer";
import { IntakeLoading } from "@/features/intake/teleform/intake-loading";
import { syncIntakeClient } from "@/features/intake/teleform/sync-intake-client";
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

function readPageCount(formJson: unknown): number {
  if (!formJson || typeof formJson !== "object") return 1;
  const pages = (formJson as { pages?: unknown }).pages;
  if (Array.isArray(pages) && pages.length > 0) return pages.length;
  const sections = (formJson as { sections?: unknown }).sections;
  if (Array.isArray(sections) && sections.length > 0) return sections.length;
  return 1;
}

export function IntakePageView() {
  const [percent, setPercent] = useState(6);
  const [loaderLabel, setLoaderLabel] = useState("Fetching intake form");
  const [loaderDetail, setLoaderDetail] = useState(
    "Loading schema and building your form…",
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [savingFinal, setSavingFinal] = useState(false);
  const [formJson, setFormJson] = useState<unknown>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);

  const handleStepAdvance = async (info: TeleformStepAdvanceInfo) => {
    if (!formJson) return false;
    setSyncing(true);
    setSyncError(null);
    const result = await syncIntakeClient({
      phase: "progress",
      formDefinition: formJson,
      values: info.values,
      page: info.progressPage,
      totalPages: info.pageCount,
    });
    setSyncing(false);
    if (!result.ok) {
      setSyncError(result.error);
      return false;
    }
    return true;
  };

  const handleTeleformSubmit = async (
    values: TeleformValues,
    metadata: { pageCount: number; progressPage: number },
  ) => {
    if (!formJson) return;
    setSavingFinal(true);
    setSyncing(true);
    setSyncError(null);

    const result = await syncIntakeClient({
      phase: "complete",
      formDefinition: formJson,
      values,
      page: metadata.progressPage,
      totalPages: metadata.pageCount,
    });

    if (!result.ok) {
      setSyncError(result.error);
      setSyncing(false);
      setSavingFinal(false);
      return;
    }

    try {
      const contact = extractCheckoutContact(values);
      saveCheckoutContactDraft(contact);
    } catch {
      // Prefer navigation even if draft extract fails.
    }

    window.location.assign("/checkout");
  };

  useEffect(() => {
    let cancelled = false;
    startedAt.current = Date.now();

    tickRef.current = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 88) return prev;
        if (prev < 30) return prev + 2.2;
        if (prev < 55) return prev + 1.4;
        if (prev < 75) return prev + 0.8;
        return prev + 0.35;
      });
    }, 160);

    void (async () => {
      try {
        setLoaderLabel("Fetching intake form");
        setLoaderDetail("Loading schema and building your form…");

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

        setFormJson(payload.formJson);
        setPercent((prev) => Math.max(prev, 62));
        setLoaderLabel("Starting intake session");
        setLoaderDetail("Creating your intake submission…");

        const totalPages = readPageCount(payload.formJson);
        const initResult = await syncIntakeClient({
          phase: "initiate",
          formDefinition: payload.formJson,
          values: {},
          page: 1,
          totalPages,
        });

        if (cancelled) return;

        if (!initResult.ok) {
          setStatus("error");
          setError(initResult.error);
          setPercent(100);
          return;
        }

        setPercent((prev) => Math.max(prev, 92));

        const elapsed = Date.now() - startedAt.current;
        const waitMore = Math.max(0, MIN_LOADER_MS - elapsed);
        if (waitMore > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMore));
        }
        if (cancelled) return;

        setPercent(100);
        setLoaderLabel("Almost ready");
        setLoaderDetail("Opening your intake form…");
        await new Promise((resolve) => setTimeout(resolve, 220));
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
            <IntakeLoading
              percent={percent}
              label={loaderLabel}
              detail={loaderDetail}
            />
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
                {syncError ? (
                  <div
                    className="mb-4 rounded-xl border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {syncError}
                  </div>
                ) : null}
                <DynamicFormRenderer
                  formDefinition={formJson}
                  showFormTitle={false}
                  syncing={syncing}
                  syncingLabel={
                    savingFinal ? "Saving…" : "Saving your answers…"
                  }
                  onStepAdvance={handleStepAdvance}
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
