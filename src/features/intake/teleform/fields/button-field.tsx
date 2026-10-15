"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isBackButtonAction,
  resolveButtonAction,
} from "@/features/intake/teleform/button-actions";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  accentColor?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  /** When set, overrides schema/label resolution (e.g. force submit on last page). */
  actionOverride?: string;
  onAction: (action: string | undefined) => void;
};

export function ButtonField({
  field,
  accentColor = "var(--primary)",
  disabled,
  loading = false,
  loadingLabel = "Submitting…",
  actionOverride,
  onAction,
}: Props) {
  const action = actionOverride || resolveButtonAction(field);
  const isBack = isBackButtonAction(action);
  const isOutline = isBack || action === "none" || !action;
  const busy = Boolean(loading);
  const blocked = Boolean(disabled) || busy;

  return (
    <div
      className={cn(
        fieldLayoutClass(field.meta?.cols, false),
        "flex items-center",
        isBack ? "justify-start" : "justify-end",
      )}
    >
      <Button
        type="button"
        variant={isOutline ? "outline" : "default"}
        disabled={blocked}
        aria-busy={busy || undefined}
        onClick={() => {
          if (blocked) return;
          onAction(action);
        }}
        style={
          isOutline
            ? { borderColor: accentColor, color: accentColor }
            : {
                backgroundColor: accentColor,
                borderColor: accentColor,
                color: "#fff",
              }
        }
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {loadingLabel}
          </>
        ) : (
          field.label?.trim() || (isBack ? "← Back" : "Next step →")
        )}
      </Button>
    </div>
  );
}
