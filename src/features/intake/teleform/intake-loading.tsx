"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Props = {
  percent: number;
  label?: string;
  detail?: string;
};

export function IntakeLoading({
  percent,
  label = "Preparing your intake",
  detail = "Loading schema and starting your session…",
}: Props) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <Loader2
          className="h-5 w-5 animate-spin text-primary"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium text-foreground">{safe}%</span>
        </div>
        <Progress value={safe} className="h-2.5" />
      </div>
    </div>
  );
}
