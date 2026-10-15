/** Companion value keys stored alongside answer fields (not schema fields). */

export function emailVerifyStatusKey(fieldName: string): string {
  return `${fieldName}__emailVerify`;
}

export function phoneCountryIsoKey(fieldName: string): string {
  return `${fieldName}__countryIso`;
}
