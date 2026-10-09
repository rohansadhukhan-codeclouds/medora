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

/** @deprecated Use ASTERMD_ENDPOINTS */
export const ASTERMD_ENDPOINT_PLACEHOLDERS = ASTERMD_ENDPOINTS;
