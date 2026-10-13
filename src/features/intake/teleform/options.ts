import type { TeleformOption } from "@/features/intake/teleform/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Normalize AsterMD options whether they are string[] or {label,value}[].
 */
export function normalizeOptions(raw: unknown): TeleformOption[] {
  if (!Array.isArray(raw)) return [];

  const out: TeleformOption[] = [];
  for (const item of raw) {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      out.push({ value, label: value });
      continue;
    }
    if (!isRecord(item)) continue;
    const value = String(
      item.value ?? item.id ?? item.key ?? item.label ?? "",
    ).trim();
    const label = String(
      item.label ?? item.text ?? item.title ?? value,
    ).trim();
    if (!value) continue;
    out.push({ value, label: label || value });
  }
  return out;
}
