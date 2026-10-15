import type { AsterMdIntakeField } from "@/lib/api/astermd/intake-submission-types";
import type { TeleformValues } from "@/features/intake/teleform/types";

const COMPOUND_LABELS = new Set([
  "unit",
  "height",
  "weight",
  "feet",
  "inches",
  "lbs",
  "kg",
  "cm",
]);

/**
 * Map AsterMD intake-submissions view `data[]` → teleform form values for prefill.
 */
export function mapIntakeFieldsToValues(
  fields: AsterMdIntakeField[] | null | undefined,
): TeleformValues {
  const values: TeleformValues = {};
  if (!Array.isArray(fields)) return values;

  for (const field of fields) {
    const name = String(field.name ?? "").trim();
    if (!name) continue;
    const entries = Array.isArray(field.value) ? field.value : [];
    if (entries.length === 0) continue;

    const type = String(field.type ?? "").toLowerCase();
    const fieldId = String(field.id ?? "").toLowerCase();
    const isBmiField =
      type === "bmi" ||
      fieldId.startsWith("bmi-") ||
      name.toLowerCase().startsWith("bmi");

    // Boolean checkbox / terms
    if (
      entries.length === 1 &&
      typeof entries[0]?.value === "boolean" &&
      (type === "checkbox" ||
        type === "terms" ||
        fieldId.startsWith("terms-") ||
        name.toLowerCase().startsWith("terms"))
    ) {
      values[name] = entries[0].value;
      continue;
    }

    // BMI / compound: entries use label as sub-key (even a single "unit" entry).
    const looksCompound =
      entries.some(
        (entry) =>
          typeof entry?.label === "string" &&
          COMPOUND_LABELS.has(entry.label.trim().toLowerCase()),
      ) || isBmiField;

    if (looksCompound) {
      const compound: Record<string, string> = {};
      for (const entry of entries) {
        const key = String(entry.label ?? "").trim();
        if (!key) continue;
        compound[key] = String(entry.value ?? "");
      }
      if (Object.keys(compound).length > 0) {
        values[name] = compound;
        continue;
      }
    }

    // Multi-select / checkbox groups with string options.
    // AsterMD often returns choice-multi as a one-element array even when
    // the teleform UI is single-select (multiSelect:false) — keep length-1
    // as a string so required validation passes without re-clicking.
    if (
      entries.length > 1 ||
      type === "checkbox" ||
      type.includes("multi") ||
      fieldId.startsWith("choice-multi")
    ) {
      if (
        entries.length === 1 &&
        typeof entries[0]?.value === "boolean"
      ) {
        values[name] = entries[0].value;
      } else if (entries.length === 1) {
        values[name] = String(entries[0]?.value ?? "");
      } else {
        values[name] = entries.map((entry) => String(entry.value ?? ""));
      }
      continue;
    }

    const single = entries[0]?.value;
    if (typeof single === "boolean") {
      values[name] = single;
    } else if (typeof single === "number") {
      values[name] = single;
    } else {
      values[name] = String(single ?? "");
    }
  }

  return values;
}
