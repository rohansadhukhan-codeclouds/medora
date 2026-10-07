/**
 * Mappers convert AsterMD wire payloads ↔ Medora domain types.
 * Implement real mappings once AsterMD API documentation is available.
 */

import type {
  Appointment,
  Intake,
  Patient,
  Prescription,
} from "@/lib/api/astermd/types";

/** Placeholder: map AsterMD patient payload → Medora Patient */
export function mapAsterMdPatient(payload: unknown): Patient {
  void payload;
  throw new Error(
    "mapAsterMdPatient is not implemented — await AsterMD API documentation",
  );
}

/** Placeholder: map AsterMD intake payload → Medora Intake */
export function mapAsterMdIntake(payload: unknown): Intake {
  void payload;
  throw new Error(
    "mapAsterMdIntake is not implemented — await AsterMD API documentation",
  );
}

/** Placeholder: map AsterMD appointment payload → Medora Appointment */
export function mapAsterMdAppointment(payload: unknown): Appointment {
  void payload;
  throw new Error(
    "mapAsterMdAppointment is not implemented — await AsterMD API documentation",
  );
}

/** Placeholder: map AsterMD prescription payload → Medora Prescription */
export function mapAsterMdPrescription(payload: unknown): Prescription {
  void payload;
  throw new Error(
    "mapAsterMdPrescription is not implemented — await AsterMD API documentation",
  );
}
