"use client";

import { useCallback, useEffect, useState } from "react";
import { Code2, RefreshCw, Trash2, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JsonView } from "@/features/dev-inspector/json-view";
import type { DevInspectorPayload } from "@/lib/dev-inspector/types";
import { cn } from "@/lib/utils/cn";

type TabId = "overview" | "channel" | "session" | "history";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "channel", label: "Channel" },
  { id: "session", label: "Session" },
  { id: "history", label: "API Call History" },
];

type Props = {
  enabled: boolean;
};

function formatTime(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

function statusColor(status?: number): string {
  if (!status) return "text-muted-foreground";
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400) return "text-destructive";
  return "text-foreground";
}

export function DevInspectorPanel({ enabled }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [payload, setPayload] = useState<DevInspectorPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dev-inspector", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (response.status === 404) {
        setError("Inspector unavailable");
        setPayload(null);
        return;
      }
      const data = (await response.json()) as DevInspectorPayload & {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || data.ok === false) {
        setError(data.error || "Failed to load inspector");
        return;
      }
      setPayload(data);
    } catch {
      setError("Failed to load inspector");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    await fetch("/api/dev-inspector", {
      method: "DELETE",
      cache: "no-store",
      credentials: "same-origin",
    });
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!enabled) return null;

  const openInspector = () => {
    setOpen(true);
    void refresh();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Developer Inspector"
        title="Developer Inspector"
        onClick={openInspector}
        className={cn(
          "fixed right-5 bottom-5 z-[80] flex h-11 w-11 items-center justify-center",
          "rounded-full border border-border bg-card text-foreground shadow-lg",
          "hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <Code2 className="h-5 w-5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Close inspector overlay"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Developer Inspector"
            className={cn(
              "absolute right-0 bottom-0 flex max-h-[85vh] w-full flex-col",
              "rounded-t-2xl border border-border bg-background shadow-2xl",
              "sm:right-5 sm:bottom-5 sm:max-h-[80vh] sm:w-[560px] sm:rounded-2xl",
            )}
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Developer Inspector
                </p>
                <p className="text-xs text-muted-foreground">
                  {payload?.overview.environment?.toUpperCase() ?? "DEV"} · AsterMD · Sanitized
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Refresh"
                  onClick={() => void refresh()}
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Clear history"
                  onClick={() => void clearHistory()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium",
                    tab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : null}

              {tab === "overview" && payload ? (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm">
                  {Object.entries(payload.overview).map(([key, value]) => (
                    <div key={key} className="contents">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {tab === "channel" && payload ? (
                payload.channel ? (
                  <div className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">
                        GET {payload.channel.endpoint}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Source:</span>{" "}
                        {payload.channel.cacheHit
                          ? "Server channel cache"
                          : "Unavailable"}
                      </p>
                      {payload.channel.cachedAt ? (
                        <p>
                          <span className="text-muted-foreground">Cached at:</span>{" "}
                          {formatTime(payload.channel.cachedAt)}
                        </p>
                      ) : null}
                      <p>
                        <span className="text-muted-foreground">ID:</span>{" "}
                        {payload.channel.id || "—"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        {payload.channel.name || "—"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {String(payload.channel.status ?? "—")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Products:</span>{" "}
                        {payload.channel.productCount}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Payment:</span>{" "}
                        {payload.channel.paymentIntegrationType ||
                          "Unknown / Not available"}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {payload.channel.products.map((product) => (
                        <li
                          key={product.id || product.name}
                          className="rounded-lg border border-border px-3 py-2 text-xs"
                        >
                          <p className="font-medium">{product.name || "Product"}</p>
                          <p className="text-muted-foreground">
                            ID: {product.id || "—"}
                          </p>
                          {product.teleformIds?.length ? (
                            <p className="text-muted-foreground">
                              Teleforms: {product.teleformIds.join(", ")}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <JsonView
                      label="Sanitized channel detail response"
                      value={payload.channel.detailResponse}
                      defaultOpen
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No channel detail yet. Open the storefront so{" "}
                    <code className="text-xs">GET /v1/sales/channels/detail/{"{id}"}</code>{" "}
                    can populate the cache.
                  </p>
                )
              ) : null}

              {tab === "session" && payload ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Session:</span>{" "}
                    {payload.journey.sessionIdMasked || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Cart:</span>{" "}
                    {payload.journey.remoteCartIdMasked || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Intake form configured:</span>{" "}
                    {payload.journey.intakeFormIdConfigured ? "Yes" : "No"}
                  </p>
                </div>
              ) : null}

              {tab === "history" ? (
                payload?.history?.length ? (
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {payload.history.map((call) => (
                      <AccordionItem
                        key={call.id}
                        value={call.id}
                        className="rounded-lg border border-border px-3 last:border-b"
                      >
                        <AccordionTrigger className="py-2.5 hover:no-underline">
                          <div className="min-w-0 flex-1 pr-2 text-left">
                            <p className="truncate text-xs font-medium text-foreground">
                              {call.method} {call.endpoint}
                            </p>
                            <p
                              className={cn(
                                "text-[11px]",
                                statusColor(call.status),
                              )}
                            >
                              {call.status ?? "—"} · {call.durationMs}ms ·{" "}
                              {formatTime(call.timestamp)}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 pb-3 text-foreground">
                          {call.error ? (
                            <p className="text-xs text-destructive">
                              Error: {call.error}
                            </p>
                          ) : null}
                          <JsonView
                            label="Headers"
                            value={call.requestHeaders}
                            defaultOpen
                          />
                          <JsonView
                            label="Request body"
                            value={call.request}
                            defaultOpen
                          />
                          <JsonView
                            label="Response"
                            value={call.response}
                            defaultOpen
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">History is empty.</p>
                )
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
