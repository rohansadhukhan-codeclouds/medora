import {
  findCountryByIso,
  formatDialPrefix,
} from "@/features/intake/data/country-dial-codes";
import {
  emailVerifyStatusKey,
  phoneCountryIsoKey,
} from "@/features/intake/teleform/field-meta";
import type { TeleformValues } from "@/features/intake/teleform/types";
import type { AsterMdOpportunityWriteBody } from "@/lib/api/astermd/opportunity-types";

function asString(value: TeleformValues[string] | undefined): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function firstNonEmpty(values: TeleformValues, keys: string[]): string {
  for (const key of keys) {
    const value = asString(values[key]);
    if (value) return value;
  }
  return "";
}

function pickByNameHint(values: TeleformValues, hints: RegExp[]): string {
  for (const [key, raw] of Object.entries(values)) {
    if (key.includes("__")) continue;
    const value = asString(raw);
    if (!value) continue;
    if (hints.some((hint) => hint.test(key))) return value;
  }
  return "";
}

function formatPhone(values: TeleformValues, national: string): string {
  if (!national) return "";
  const countryIso =
    asString(values[phoneCountryIsoKey("phone")]) ||
    asString(values[phoneCountryIsoKey("mobile")]) ||
    asString(values[phoneCountryIsoKey("telephone")]) ||
    "";
  const country = countryIso ? findCountryByIso(countryIso) : undefined;
  if (!country) return national;
  const prefix = formatDialPrefix(country.dial);
  if (national.startsWith("+") || national.startsWith(prefix)) return national;
  return `${prefix} ${national}`;
}

function parseNumber(raw: string): number | undefined {
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Build a partial opportunity update from teleform answers.
 * Only includes keys that have real values (no empty placeholders).
 */
export function extractOpportunityPatch(
  values: TeleformValues,
): AsterMdOpportunityWriteBody {
  const patch: AsterMdOpportunityWriteBody = {};

  const firstName =
    firstNonEmpty(values, ["first_name", "firstName", "firstname"]) ||
    pickByNameHint(values, [/^first[_-]?name$/i, /given.?name/i]);
  const lastName =
    firstNonEmpty(values, ["last_name", "lastName", "surname", "lastname"]) ||
    pickByNameHint(values, [/^last[_-]?name$/i, /sur.?name/i, /family.?name/i]);
  const middleName =
    firstNonEmpty(values, ["middle_name", "middleName"]) ||
    pickByNameHint(values, [/^middle[_-]?name$/i]);

  if (firstName) patch.first_name = firstName;
  if (middleName) patch.middle_name = middleName;
  if (lastName) patch.last_name = lastName;

  const email =
    firstNonEmpty(values, ["email_id", "email", "emailAddress"]) ||
    pickByNameHint(values, [/email/i]);
  if (email) {
    patch.email = email.toLowerCase();
    const verify =
      asString(values[emailVerifyStatusKey("email_id")]) ||
      asString(values[emailVerifyStatusKey("email")]);
    if (verify === "valid" || verify === "invalid") {
      patch.email_validation = verify;
    }
  }

  const nationalPhone =
    firstNonEmpty(values, ["phone", "mobile", "telephone", "phone_number"]) ||
    pickByNameHint(values, [/phone|mobile|tel/i]);
  const phone = formatPhone(values, nationalPhone);
  if (phone) patch.phone = phone;

  const dob =
    firstNonEmpty(values, ["dob", "date_of_birth", "dateOfBirth", "birthdate"]) ||
    pickByNameHint(values, [/dob|birth.?date|date.?of.?birth/i]);
  if (dob) patch.dob = dob;

  const gender =
    firstNonEmpty(values, ["gender", "sex"]) ||
    pickByNameHint(values, [/^gender$/i, /^sex$/i]);
  if (gender) patch.gender = gender;

  // BMI compound field → clinical block when present.
  const bmiRaw = values.bmi ?? values.BMI;
  if (bmiRaw && typeof bmiRaw === "object" && !Array.isArray(bmiRaw)) {
    const unit = asString(bmiRaw.unit);
    const height = parseNumber(asString(bmiRaw.height));
    const weight = parseNumber(asString(bmiRaw.weight));
    const clinical: NonNullable<AsterMdOpportunityWriteBody["clinical"]> = {};
    if (height !== undefined) {
      clinical.height = {
        value: height,
        unit: unit.toLowerCase().includes("imperial") ? "in" : "cm",
      };
    }
    if (weight !== undefined) {
      clinical.weight = {
        value: weight,
        unit: unit.toLowerCase().includes("imperial") ? "lbs" : "kg",
      };
    }
    if (Object.keys(clinical).length > 0) patch.clinical = clinical;
  }

  return patch;
}

export function opportunityPatchHasContent(
  patch: AsterMdOpportunityWriteBody,
): boolean {
  return Object.keys(patch).length > 0;
}
