/**
 * INTEGRATION CONTRACT — PLACEHOLDER ONLY
 *
 * Do not treat these path strings as real AsterMD endpoints.
 * Replace with documented paths from AsterMD API documentation.
 */
export const ASTERMD_ENDPOINT_PLACEHOLDERS = {
  patients: "/patients",
  patientById: (id: string) => `/patients/${id}`,
  intakes: "/intakes",
  intakeById: (id: string) => `/intakes/${id}`,
  appointments: "/appointments",
  prescriptions: "/prescriptions",
  messages: "/messages",
  conversations: "/conversations",
  providerStatus: "/provider/status",
} as const;
