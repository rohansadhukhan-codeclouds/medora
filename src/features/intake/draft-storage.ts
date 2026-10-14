import type { PatientInfoValues } from "@/features/intake/schemas/patient-info-schema";
import type { TeleformValues } from "@/features/intake/teleform/types";

/**
 * Temporary browser draft bridge between teleform → information → checkout.
 * Uses sessionStorage (tab-scoped), not localStorage.
 * PENDING: replace with AsterMD opportunity / verification APIs — do not treat as durable PHI store.
 */
export const INTAKE_DRAFT_STORAGE_KEY = "medora.intake.draft.v1";

export type IntakeTeleformDraft = {
  formId?: string;
  version?: number;
  title?: string;
  values: TeleformValues;
  savedAt: string;
};

export type IntakeDraft = {
  teleform?: IntakeTeleformDraft;
  patientInfo?: PatientInfoValues;
  patientInfoSavedAt?: string;
};

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readIntakeDraft(): IntakeDraft | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(INTAKE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntakeDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeIntakeDraft(draft: IntakeDraft): void {
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(INTAKE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Quota / private mode — fail soft; next page can redirect if missing.
  }
}

export function saveTeleformDraft(
  values: TeleformValues,
  metadata: { formId?: string; version?: number; title?: string },
): IntakeDraft {
  const existing = readIntakeDraft() ?? {};
  const next: IntakeDraft = {
    ...existing,
    teleform: {
      formId: metadata.formId,
      version: metadata.version,
      title: metadata.title,
      values,
      savedAt: new Date().toISOString(),
    },
  };
  writeIntakeDraft(next);
  return next;
}

export function savePatientInfoDraft(patientInfo: PatientInfoValues): IntakeDraft {
  const existing = readIntakeDraft() ?? {};
  const next: IntakeDraft = {
    ...existing,
    patientInfo,
    patientInfoSavedAt: new Date().toISOString(),
  };
  writeIntakeDraft(next);
  return next;
}

export function hasTeleformDraft(): boolean {
  const draft = readIntakeDraft();
  return Boolean(draft?.teleform?.values);
}

export function clearIntakeDraft(): void {
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.removeItem(INTAKE_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
