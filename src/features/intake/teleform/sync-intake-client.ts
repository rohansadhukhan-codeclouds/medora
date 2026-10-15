import type { TeleformValues } from "@/features/intake/teleform/types";
import type { IntakeSyncPhase } from "@/lib/api/astermd/intake-submission-types";

export type IntakeSyncClientResult =
  | {
      ok: true;
      phase: IntakeSyncPhase;
      submissionId?: string | null;
      sessionId?: string | null;
      created?: boolean;
    }
  | { ok: false; error: string };

export type IntakeResumeClientResult =
  | {
      ok: true;
      resumed: boolean;
      reason?: string;
      submissionId: string | null;
      sessionId?: string | null;
      teleformId?: string | null;
      event: string | null;
      values: TeleformValues;
    }
  | { ok: false; error: string };

type SyncArgs = {
  phase: IntakeSyncPhase;
  formDefinition?: unknown;
  values?: TeleformValues;
  /** 1-based current page for AsterMD progress.meta */
  page?: number;
  totalPages?: number;
};

/**
 * Browser → BFF progressive intake sync. Does not log values (PHI).
 */
export async function syncIntakeClient(
  args: SyncArgs,
): Promise<IntakeSyncClientResult> {
  try {
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        phase: args.phase,
        values: args.values ?? {},
        formDefinition: args.formDefinition,
        page: args.page,
        totalPages: args.totalPages,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      phase?: IntakeSyncPhase;
      submissionId?: string | null;
      sessionId?: string | null;
      created?: boolean;
    };

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        error:
          payload.error || "Unable to save your intake. Please try again.",
      };
    }

    return {
      ok: true,
      phase: payload.phase ?? args.phase,
      submissionId: payload.submissionId ?? null,
      sessionId: payload.sessionId ?? null,
      created: payload.created,
    };
  } catch {
    return {
      ok: false,
      error: "Unable to save your intake. Please try again.",
    };
  }
}

/** Browser → BFF view for resume prefill. */
export async function resumeIntakeClient(): Promise<IntakeResumeClientResult> {
  try {
    const response = await fetch("/api/intake", {
      method: "GET",
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      resumed?: boolean;
      reason?: string;
      submissionId?: string | null;
      sessionId?: string | null;
      teleformId?: string | null;
      event?: string | null;
      values?: TeleformValues;
    };

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        error:
          payload.error || "Unable to resume your intake. Please try again.",
      };
    }

    return {
      ok: true,
      resumed: Boolean(payload.resumed),
      reason: payload.reason,
      submissionId: payload.submissionId ?? null,
      sessionId: payload.sessionId ?? null,
      teleformId: payload.teleformId ?? null,
      event: payload.event ?? null,
      values: payload.values ?? {},
    };
  } catch {
    return {
      ok: false,
      error: "Unable to resume your intake. Please try again.",
    };
  }
}
