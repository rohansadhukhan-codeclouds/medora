/**
 * AsterMD API paths (relative to /v1/{service}).
 * Auth + channel detail paths match the official AsterMD SDK.
 */
export const ASTERMD_ENDPOINTS = {
  authToken: "/v1/auth/api-credentials/token",
  channelDetail: (channelId: string) =>
    `/v1/sales/channels/detail/${encodeURIComponent(channelId)}`,
  sessionsCreate: "/v1/sales/sessions/create",
  sessionsView: "/v1/sales/sessions/view",
  cartsCreate: "/v1/sales/carts/create",
  cartsUpdate: (sessionId: string) =>
    `/v1/sales/carts/update/${encodeURIComponent(sessionId)}`,
  cartsView: (sessionId: string) =>
    `/v1/sales/carts/view/${encodeURIComponent(sessionId)}`,
  teleformsView: (teleformId: string) =>
    `/v1/sales/teleforms/view/${encodeURIComponent(teleformId)}`,
  /**
   * form_json_identifier is a full S3 key (may include `/`).
   * Encode the whole key as one path segment (`/` → `%2F`), matching AsterMD.
   * Example: …/view-url/acct%2Forg%2Fslug_42.json
   */
  teleformsViewUrl: (formJsonIdentifier: string) =>
    `/v1/sales/teleforms/view-url/${encodeURIComponent(formJsonIdentifier)}`,

  // Remaining domain paths stay placeholders until wired from docs/SDK.
  patients: "/v1/sales/patients",
  patientById: (id: string) => `/v1/sales/patients/${encodeURIComponent(id)}`,
  intakes: "/v1/sales/intake-submissions",
  intakeById: (id: string) =>
    `/v1/sales/intake-submissions/${encodeURIComponent(id)}`,
  appointments: "/v1/sales/appointments",
  prescriptions: "/v1/sales/prescriptions",
  messages: "/v1/sales/messages",
  conversations: "/v1/sales/conversations",
  providerStatus: "/v1/sales/provider/status",
} as const;
