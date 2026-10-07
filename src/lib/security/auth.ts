import "server-only";
import { MOCK_PATIENT_ID } from "@/lib/api/astermd/mock-data";

/**
 * Auth placeholder for Medora.
 *
 * Production requirements (TODO):
 * - Issue HttpOnly, Secure, SameSite cookies for session tokens
 * - Never store PHI or auth tokens in localStorage
 * - Validate sessions server-side on every patient route
 * - Integrate with AsterMD / identity provider auth flows
 * - Avoid putting patient identifiers in URLs when avoidable
 *
 * This helper returns a demo patient id for local UI development only.
 * It does NOT claim HIPAA compliance.
 */
export async function getCurrentPatientId(): Promise<string> {
  // TODO(security): Replace with real session/cookie resolution.
  return MOCK_PATIENT_ID;
}

export async function requirePatientSession(): Promise<string> {
  const patientId = await getCurrentPatientId();
  if (!patientId) {
    throw new Error("Unauthorized");
  }
  return patientId;
}
