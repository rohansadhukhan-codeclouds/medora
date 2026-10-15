import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

/**
 * AsterMD sometimes sets buttonAction to "none" even on Next/Back labels
 * (seen on final teleform pages). Infer navigation from the label then.
 */
export function resolveButtonAction(field: NormalizedTeleformField): string {
  const raw = (field.meta?.buttonAction || "").toLowerCase().trim();
  if (raw && raw !== "none") {
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

export function isBackButtonAction(action: string): boolean {
  return action === "previous_page" || action === "back" || action === "prev";
}
