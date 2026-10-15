import {
  emailVerifyStatusKey,
  phoneCountryIsoKey,
} from "@/features/intake/teleform/field-meta";
import {
  isAnswerField,
  type NormalizedTeleform,
  type NormalizedTeleformField,
  type TeleformFieldType,
  type TeleformValues,
} from "@/features/intake/teleform/types";
import type { AsterMdIntakeField } from "@/lib/api/astermd/intake-submission-types";

function mapAsterType(type: TeleformFieldType, rawType?: string): string {
  switch (type) {
    case "textarea":
      return "textarea";
    case "date":
      return "date";
    case "radio":
    case "choice_single":
      return "radio";
    case "checkbox":
    case "terms":
    case "checkbox_group":
    case "choice_multi":
      return "checkbox";
    case "select":
    case "dropdown":
      return "dropdown";
    default:
      if (rawType?.toLowerCase().includes("rating")) return "rating";
      if (rawType?.toLowerCase().includes("file")) return "file";
      return "text";
  }
}

function optionLabel(
  field: NormalizedTeleformField,
  optionValue: string,
): string | undefined {
  return field.options?.find((option) => option.value === optionValue)?.label;
}

function toValueEntries(
  field: NormalizedTeleformField,
  raw: TeleformValues[string] | undefined,
): AsterMdIntakeField["value"] {
  if (raw === undefined || raw === null) return [];

  if (typeof raw === "boolean") {
    return [{ value: raw }];
  }

  if (typeof raw === "number") {
    return Number.isFinite(raw) ? [{ value: raw }] : [];
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    const label = optionLabel(field, trimmed);
    return label ? [{ value: trimmed, label }] : [{ value: trimmed }];
  }

  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item).trim())
      .filter(Boolean)
      .map((item) => {
        const label = optionLabel(field, item);
        return label ? { value: item, label } : { value: item };
      });
  }

  if (typeof raw === "object") {
    // BMI / compound fields — one entry per sub-key.
    return Object.entries(raw)
      .filter(([, value]) => String(value ?? "").trim() !== "")
      .map(([key, value]) => ({
        value: String(value).trim(),
        label: key,
      }));
  }

  return [];
}

/**
 * Build AsterMD intake-submissions `data` list from teleform answers.
 * Skips presentation fields and companion meta keys (__emailVerify, etc.).
 */
export function mapTeleformValuesToIntakeFields(
  form: NormalizedTeleform,
  values: TeleformValues,
): AsterMdIntakeField[] {
  const fields: AsterMdIntakeField[] = [];

  for (const section of form.sections) {
    for (const field of section.fields) {
      if (!isAnswerField(field)) continue;
      if (!field.name || field.name.includes("__")) continue;
      if (
        field.name === emailVerifyStatusKey(field.name) ||
        field.name === phoneCountryIsoKey(field.name)
      ) {
        continue;
      }

      const entries = toValueEntries(field, values[field.name]);
      // Still send answered empty checkbox/terms as false when present.
      if (
        entries.length === 0 &&
        (field.type === "checkbox" || field.type === "terms") &&
        typeof values[field.name] === "boolean"
      ) {
        entries.push({ value: Boolean(values[field.name]) });
      }

      if (entries.length === 0) continue;

      fields.push({
        id: field.id || field.name,
        name: field.name,
        label: field.label || field.name,
        type: mapAsterType(field.type, field.rawType),
        value: entries,
      });
    }
  }

  return fields;
}
