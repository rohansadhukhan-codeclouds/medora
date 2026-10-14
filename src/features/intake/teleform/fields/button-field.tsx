"use client";

import { Button } from "@/components/ui/button";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  accentColor?: string;
  disabled?: boolean;
  onAction: (action: string | undefined) => void;
};

/**
 * AsterMD sometimes sets buttonAction to "none" even on Next/Back labels
 * (seen on final teleform pages). Infer navigation from the label then.
 */
export function resolveButtonAction(field: NormalizedTeleformField): string {
  const raw = (field.meta?.buttonAction || "").toLowerCase().trim();
  if (raw && raw !== "none") {
    // Normalize camelCase / variants from the schema.
    if (raw === "nextpage" || raw === "next") return "next_page";
    if (raw === "previouspage" || raw === "prev") return "previous_page";
    return raw;
  }

  const label = field.label || "";
  if (/back|previous/i.test(label)) return "previous_page";
  if (/submit|finish|complete/i.test(label)) return "submit";
  if (/next|continue/i.test(label)) return "next_page";
  return raw;
}

export function ButtonField({
  field,
  accentColor = "var(--primary)",
  disabled,
  onAction,
}: Props) {
  const action = resolveButtonAction(field);
  const isBack = action === "previous_page" || action === "back";
  const isOutline = isBack || action === "none" || !action;

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
        disabled={disabled}
        onClick={() => onAction(action)}
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
        {field.label?.trim() || (isBack ? "← Back" : "Next step →")}
      </Button>
    </div>
  );
}
