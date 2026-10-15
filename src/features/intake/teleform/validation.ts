import {
  isValidPhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import { DEFAULT_PHONE_COUNTRY_ISO } from "@/features/intake/data/country-dial-codes";
import {
  emailVerifyStatusKey,
  phoneCountryIsoKey,
} from "@/features/intake/teleform/field-meta";
import {
  isAnswerField,
  type NormalizedTeleformField,
  type TeleformValues,
} from "@/features/intake/teleform/types";

function asString(value: TeleformValues[string] | undefined): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  // Resume may leave a one-element array on single-select choice fields.
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0] ?? "");
  }
  return "";
}

function readNumericRule(
  validation: NormalizedTeleformField["validation"],
  key: "minLength" | "maxLength" | "minValue" | "maxValue",
): number | undefined {
  const direct = validation?.[key];
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;

  const fromMessage = validation?.errorMessages?.[key];
  if (typeof fromMessage === "string" && /^\d+(\.\d+)?$/.test(fromMessage.trim())) {
    return Number(fromMessage.trim());
  }
  return undefined;
}

function messageFor(
  validation: NormalizedTeleformField["validation"],
  key: string,
  fallback: string,
): string {
  const raw = validation?.errorMessages?.[key];
  // AsterMD sometimes puts the constraint value ("2") in errorMessages — not copy.
  if (raw && !/^\d+(\.\d+)?$/.test(raw.trim())) return raw;
  return fallback;
}

/**
 * Validate a single answer-producing field against API validation + required.
 */
export function validateField(
  field: NormalizedTeleformField,
  values: TeleformValues,
): string | null {
  if (!isAnswerField(field)) return null;

  const value = values[field.name];
  const validation = field.validation;
  const required = field.required || validation?.required === true;

  if (field.type === "terms" || field.type === "checkbox") {
    if (required && value !== true) {
      return messageFor(validation, "required", "This field is required");
    }
    return null;
  }

  if (field.type === "checkbox_group" || field.type === "choice_multi") {
    const multi = field.meta?.multiSelect === true || field.type === "checkbox_group";
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      if (required && arr.length === 0) {
        return messageFor(validation, "required", "Please select at least one option");
      }
      return null;
    }
  }

  if (field.type === "bmi") {
    if (
      required &&
      (!(value && typeof value === "object" && !Array.isArray(value)) ||
        !value.height ||
        !value.weight)
    ) {
      return messageFor(validation, "required", "Height and weight are required");
    }
    return null;
  }

  const text = asString(value).trim();

  if (required && !text) {
    return messageFor(validation, "required", "This field is required");
  }

  if (!text) return null;

  if (field.type === "email") {
    const status = asString(values[emailVerifyStatusKey(field.name)]);
    if (status === "valid") return null;
    if (status === "checking" || status === "typing") {
      return "Please wait for email verification";
    }
    if (status === "invalid" || status === "failed") {
      return "Invalid email";
    }
    if (status === "unknown") {
      return "Could not confirm this email. Try again shortly.";
    }
    return "Please wait for email verification";
  }

  if (field.type === "tel" || field.type === "phone") {
    const digits = text.replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (digits.length < 6) {
      return messageFor(validation, "phone", "Enter a valid phone number");
    }
    const country = (
      asString(values[phoneCountryIsoKey(field.name)]) ||
      DEFAULT_PHONE_COUNTRY_ISO
    ).toUpperCase() as CountryCode;
    try {
      if (!isValidPhoneNumber(text, country)) {
        return "Phone number does not belong to this country";
      }
    } catch {
      return "Phone number does not belong to this country";
    }
    return null;
  }

  const minLength = readNumericRule(validation, "minLength");
  if (typeof minLength === "number" && text.length < minLength) {
    return messageFor(
      validation,
      "minLength",
      `Must be at least ${minLength} characters`,
    );
  }

  const maxLength = readNumericRule(validation, "maxLength");
  if (typeof maxLength === "number" && text.length > maxLength) {
    return messageFor(
      validation,
      "maxLength",
      `Must be at most ${maxLength} characters`,
    );
  }

  if (field.type === "number") {
    const num = Number(text);
    if (!Number.isFinite(num)) {
      return messageFor(validation, "number", "Enter a valid number");
    }
    const minValue = readNumericRule(validation, "minValue");
    if (typeof minValue === "number" && num < minValue) {
      return messageFor(validation, "minValue", `Must be at least ${minValue}`);
    }
    const maxValue = readNumericRule(validation, "maxValue");
    if (typeof maxValue === "number" && num > maxValue) {
      return messageFor(validation, "maxValue", `Must be at most ${maxValue}`);
    }
  }

  return null;
}

export function validateFields(
  fields: NormalizedTeleformField[],
  values: TeleformValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const error = validateField(field, values);
    if (error) errors[field.name] = error;
  }
  return errors;
}
