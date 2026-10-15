/**
 * Client resume metadata for an in-progress intake submission.
 * Stores ids + timestamps only — never answer PHI.
 * Form answers live in `intake-draft-storage` (local draft, 24h TTL).
 * AsterMD view may still supply leftover server answers on resume.
 */
export const INTAKE_RESUME_KEY = "medora.intake.resume.v1";
export const INTAKE_RESUME_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

export type IntakeResumeMeta = {
  submissionId: string;
  teleformId: string;
  sessionId?: string;
  initiatedAt: number;
  /** Set when user finishes intake and leaves for checkout. */
  completedAt?: number | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseMeta(raw: string): IntakeResumeMeta | null {
  try {
    const parsed = JSON.parse(raw) as IntakeResumeMeta;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.submissionId !== "string" || !parsed.submissionId.trim()) {
      return null;
    }
    if (typeof parsed.teleformId !== "string" || !parsed.teleformId.trim()) {
      return null;
    }
    if (typeof parsed.initiatedAt !== "number" || !Number.isFinite(parsed.initiatedAt)) {
      return null;
    }
    return {
      submissionId: parsed.submissionId.trim(),
      teleformId: parsed.teleformId.trim(),
      sessionId:
        typeof parsed.sessionId === "string" && parsed.sessionId.trim()
          ? parsed.sessionId.trim()
          : undefined,
      initiatedAt: parsed.initiatedAt,
      completedAt:
        typeof parsed.completedAt === "number" ? parsed.completedAt : null,
    };
  } catch {
    return null;
  }
}

export function isIntakeResumeExpired(
  meta: IntakeResumeMeta,
  now = Date.now(),
): boolean {
  return now - meta.initiatedAt > INTAKE_RESUME_TTL_MS;
}

/**
 * Valid in-progress resume candidate (not expired, not completed).
 */
export function readActiveIntakeResume(
  teleformId?: string,
): IntakeResumeMeta | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(INTAKE_RESUME_KEY);
    if (!raw) return null;
    const meta = parseMeta(raw);
    if (!meta) {
      localStorage.removeItem(INTAKE_RESUME_KEY);
      return null;
    }
    if (isIntakeResumeExpired(meta) || meta.completedAt) {
      return null;
    }
    if (teleformId && meta.teleformId !== teleformId.trim()) {
      return null;
    }
    return meta;
  } catch {
    return null;
  }
}

export function saveIntakeResumeMeta(
  meta: Omit<IntakeResumeMeta, "completedAt"> & { completedAt?: null },
): void {
  if (!canUseStorage()) return;
  try {
    const payload: IntakeResumeMeta = {
      submissionId: meta.submissionId,
      teleformId: meta.teleformId,
      sessionId: meta.sessionId,
      initiatedAt: meta.initiatedAt,
      completedAt: null,
    };
    localStorage.setItem(INTAKE_RESUME_KEY, JSON.stringify(payload));
  } catch {
    // fail soft
  }
}

export function markIntakeResumeCompleted(now = Date.now()): void {
  if (!canUseStorage()) return;
  try {
    const raw = localStorage.getItem(INTAKE_RESUME_KEY);
    if (!raw) return;
    const meta = parseMeta(raw);
    if (!meta) {
      localStorage.removeItem(INTAKE_RESUME_KEY);
      return;
    }
    localStorage.setItem(
      INTAKE_RESUME_KEY,
      JSON.stringify({ ...meta, completedAt: now }),
    );
  } catch {
    // fail soft
  }
}

export function clearIntakeResumeMeta(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(INTAKE_RESUME_KEY);
  } catch {
    // fail soft
  }
}
