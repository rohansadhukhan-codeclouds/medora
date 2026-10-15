import {
  findCountryByIso,
  formatDialPrefix,
} from "@/features/intake/data/country-dial-codes";
import { phoneCountryIsoKey } from "@/features/intake/teleform/field-meta";
import type { TeleformValues } from "@/features/intake/teleform/types";

function asString(value: TeleformValues[string] | undefined): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function firstNonEmpty(
  values: TeleformValues,
  keys: string[],
): string {
  for (const key of keys) {
    const value = asString(values[key]);
    if (value) return value;
  }
  return "";
}

function pickByNameHint(
  values: TeleformValues,
  hints: RegExp[],
): string {
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

/**
 * Pull contact fields from teleform answers for checkout prefills.
 * Prefers known AsterMD field names (first_name, last_name, email_id, phone).
 */
export function extractCheckoutContact(values: TeleformValues): {
  name: string;
  email: string;
  phone: string;
} {
  const firstName =
    firstNonEmpty(values, ["first_name", "firstName", "firstname"]) ||
    pickByNameHint(values, [/^first[_-]?name$/i, /given.?name/i]);
  const lastName =
    firstNonEmpty(values, ["last_name", "lastName", "surname", "lastname"]) ||
    pickByNameHint(values, [/^last[_-]?name$/i, /sur.?name/i, /family.?name/i]);
  const fullName =
    firstNonEmpty(values, ["full_name", "fullName", "name"]) ||
    [firstName, lastName].filter(Boolean).join(" ").trim();

  const email =
    firstNonEmpty(values, ["email_id", "email", "emailAddress"]) ||
    pickByNameHint(values, [/email/i]);

  const nationalPhone =
    firstNonEmpty(values, ["phone", "mobile", "telephone", "phone_number"]) ||
    pickByNameHint(values, [/phone|mobile|tel/i]);

  return {
    name: fullName,
    email,
    phone: formatPhone(values, nationalPhone),
  };
}
