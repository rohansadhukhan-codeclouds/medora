import type { TeleformValues } from "@/features/intake/teleform/types";

/**
 * Client-side intake draft (form answers) with 24h TTL.
 * Used so step navigation stays local; AsterMD update runs only on final submit.
 */
export const INTAKE_DRAFT_KEY = "medora.intake.draft.v1";
export const INTAKE_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export type IntakeDraftRecord = {
  data: TeleformValues;
  teleformId?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isPlainValues(value: unknown): value is TeleformValues {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseDraft(raw: string): IntakeDraftRecord | null {
  try {
    const parsed = JSON.parse(raw) as Partial<IntakeDraftRecord>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!isPlainValues(parsed.data)) return null;
    if (typeof parsed.createdAt !== "number" || !Number.isFinite(parsed.createdAt)) {
      return null;
    }
    if (typeof parsed.expiresAt !== "number" || !Number.isFinite(parsed.expiresAt)) {
      return null;
    }
    return {
      data: parsed.data,
      teleformId:
        typeof parsed.teleformId === "string" && parsed.teleformId.trim()
          ? parsed.teleformId.trim()
          : undefined,
      createdAt: parsed.createdAt,
      updatedAt:
        typeof parsed.updatedAt === "number" && Number.isFinite(parsed.updatedAt)
          ? parsed.updatedAt
          : parsed.createdAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function isIntakeDraftExpired(
  draft: Pick<IntakeDraftRecord, "expiresAt">,
  now = Date.now(),
): boolean {
  return now >= draft.expiresAt;
}

export function clearIntakeDraft(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(INTAKE_DRAFT_KEY);
  } catch {
    // fail soft
  }
}

/**
 * Read a non-expired draft. Removes the entry when expired or corrupt.
 */
export function getIntakeDraft(teleformId?: string): IntakeDraftRecord | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(INTAKE_DRAFT_KEY);
    if (!raw) return null;
    const draft = parseDraft(raw);
    if (!draft) {
      localStorage.removeItem(INTAKE_DRAFT_KEY);
      return null;
    }
    if (isIntakeDraftExpired(draft)) {
      localStorage.removeItem(INTAKE_DRAFT_KEY);
      return null;
    }
    if (teleformId && draft.teleformId && draft.teleformId !== teleformId.trim()) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveIntakeDraft(
  data: TeleformValues,
  options?: { teleformId?: string },
): void {
  if (!canUseStorage()) return;
  try {
    const now = Date.now();
    const existing = getIntakeDraft(options?.teleformId);
    const createdAt = existing?.createdAt ?? now;
    const payload: IntakeDraftRecord = {
      data,
      teleformId: options?.teleformId?.trim() || existing?.teleformId,
      createdAt,
      updatedAt: now,
      expiresAt: createdAt + INTAKE_DRAFT_TTL_MS,
    };
    localStorage.setItem(INTAKE_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // fail soft (quota / private mode)
  }
}

function isEmptyDraftValue(value: TeleformValues[string] | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return false;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    return Object.values(value).every(
      (entry) => entry === undefined || entry === null || String(entry).trim() === "",
    );
  }
  return true;
}

/**
 * Merge server resume answers with a local draft.
 * Local non-empty values win (draft is the latest client state when steps are not synced).
 * Empty local keys do not wipe server/default values.
 */
export function mergeIntakePrefill(
  serverValues: TeleformValues | undefined,
  draftData: TeleformValues | undefined,
): TeleformValues {
  const merged: TeleformValues = { ...(serverValues ?? {}) };
  if (!draftData) return merged;

  for (const [key, value] of Object.entries(draftData)) {
    if (isEmptyDraftValue(value)) continue;
    merged[key] = value;
  }
  return merged;
}
