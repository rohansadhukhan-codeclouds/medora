import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import type {
  AsterMdIntakeEvent,
  AsterMdIntakeField,
  AsterMdIntakeProgress,
  AsterMdIntakeSubmissionApiResponse,
  AsterMdIntakeSubmissionRecord,
  CreateAsterMdIntakeSubmissionBody,
  IntakeSyncPhase,
} from "@/lib/api/astermd/intake-submission-types";

export type { IntakeSyncPhase };

const globalState = globalThis as typeof globalThis & {
  __medoraMockIntakeSubmissions?: Map<string, AsterMdIntakeSubmissionRecord>;
};

function mockStore(): Map<string, AsterMdIntakeSubmissionRecord> {
  if (!globalState.__medoraMockIntakeSubmissions) {
    globalState.__medoraMockIntakeSubmissions = new Map();
  }
  return globalState.__medoraMockIntakeSubmissions;
}

function mockKey(sessionId: string, teleformId: string): string {
  return `${sessionId}::${teleformId}`;
}

function assertSessionId(sessionId: string): string {
  const id = sessionId.trim();
  if (!id) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD intake submission requires a session UUID",
      userMessage: "Your browsing session is missing. Please refresh the page.",
    });
  }
  return id;
}

function assertTeleformId(teleformId: string): string {
  const id = teleformId.trim();
  if (!id) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD intake submission requires teleform_id",
      userMessage: "Intake form is not configured. Please try again later.",
    });
  }
  return id;
}

function buildBody(input: {
  sessionId: string;
  event: AsterMdIntakeEvent;
  teleformId: string;
  data: AsterMdIntakeField[];
  progress?: AsterMdIntakeProgress;
}): CreateAsterMdIntakeSubmissionBody {
  const body: CreateAsterMdIntakeSubmissionBody = {
    session: assertSessionId(input.sessionId),
    event: input.event,
    teleform_id: assertTeleformId(input.teleformId),
    data: Array.isArray(input.data) ? input.data : [],
  };
  if (input.progress) {
    body.progress = input.progress;
  }
  return body;
}

/**
 * POST /v1/sales/intake-submissions/create
 * Use with `intake_initiated` (or pre_qualifying_initiated) on first write.
 * Do not log `data` — PHI.
 */
export async function createIntakeSubmission(input: {
  sessionId: string;
  event: AsterMdIntakeEvent;
  teleformId: string;
  data: AsterMdIntakeField[];
  progress?: AsterMdIntakeProgress;
}): Promise<AsterMdIntakeSubmissionRecord> {
  const config = getAsterMdConfig();
  const body = buildBody(input);

  if (config.useMock) {
    const record: AsterMdIntakeSubmissionRecord = {
      _id: `mock-intake-${body.session}`,
      session: body.session,
      teleform_id: body.teleform_id,
      status: "initiated",
      progress: body.progress,
      data: body.data,
    };
    mockStore().set(mockKey(body.session, body.teleform_id), record);
    return record;
  }

  const payload = await asterMdFetch<AsterMdIntakeSubmissionApiResponse>({
    method: "POST",
    path: ASTERMD_ENDPOINTS.intakeSubmissionsCreate,
    body,
  });

  if (!payload.data) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD intake create returned no data",
      userMessage: "Unable to save your intake. Please try again.",
    });
  }

  return payload.data;
}

/**
 * PUT /v1/sales/intake-submissions/update/{session}
 * Use with `intake_inprogress` / `intake_completed` after create.
 * Full accumulated `data` every call (server replaces, does not merge).
 */
export async function updateIntakeSubmission(input: {
  sessionId: string;
  event: AsterMdIntakeEvent;
  teleformId: string;
  data: AsterMdIntakeField[];
  progress?: AsterMdIntakeProgress;
}): Promise<AsterMdIntakeSubmissionRecord> {
  const config = getAsterMdConfig();
  const body = buildBody(input);
  const sessionId = body.session;

  if (config.useMock) {
    const key = mockKey(sessionId, body.teleform_id);
    const existing = mockStore().get(key);
    const record: AsterMdIntakeSubmissionRecord = {
      _id: existing?._id ?? `mock-intake-${sessionId}`,
      session: sessionId,
      teleform_id: body.teleform_id,
      status: body.event.includes("completed") ? "completed" : "in_progress",
      progress: body.progress,
      data: body.data,
    };
    mockStore().set(key, record);
    return record;
  }

  const payload = await asterMdFetch<AsterMdIntakeSubmissionApiResponse>({
    method: "PUT",
    path: ASTERMD_ENDPOINTS.intakeSubmissionsUpdate(sessionId),
    body,
  });

  if (!payload.data) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD intake update returned no data",
      userMessage: "Unable to save your intake. Please try again.",
    });
  }

  return payload.data;
}

function isLikelyAlreadyCreated(error: AsterMdError): boolean {
  return (
    error.status === 400 ||
    error.status === 409 ||
    error.status === 422 ||
    error.code === "validation_error"
  );
}

/**
 * Progressive intake sync (official AsterMD SDK events):
 * - initiate  → POST create + intake_initiated
 * - progress  → PUT update + intake_inprogress
 * - complete  → PUT update + intake_completed
 *
 * If update runs before a successful create, attempts create first.
 */
export async function syncIntakeSubmission(input: {
  phase: IntakeSyncPhase;
  sessionId: string;
  teleformId: string;
  data: AsterMdIntakeField[];
  progress?: AsterMdIntakeProgress;
}): Promise<{
  phase: IntakeSyncPhase;
  created: boolean;
  record: AsterMdIntakeSubmissionRecord;
}> {
  if (input.phase === "initiate") {
    try {
      const record = await createIntakeSubmission({
        sessionId: input.sessionId,
        event: "intake_initiated",
        teleformId: input.teleformId,
        data: input.data,
        progress: input.progress,
      });
      return { phase: "initiate", created: true, record };
    } catch (error) {
      if (!(error instanceof AsterMdError) || !isLikelyAlreadyCreated(error)) {
        throw error;
      }
      console.warn(
        "[AsterMD] intake initiate skipped (existing)",
        error.code,
        error.status,
      );
      // Already started — push current snapshot as in-progress.
      const record = await updateIntakeSubmission({
        sessionId: input.sessionId,
        event: "intake_inprogress",
        teleformId: input.teleformId,
        data: input.data,
        progress: input.progress,
      });
      return { phase: "initiate", created: false, record };
    }
  }

  const event: AsterMdIntakeEvent =
    input.phase === "complete" ? "intake_completed" : "intake_inprogress";

  try {
    const record = await updateIntakeSubmission({
      sessionId: input.sessionId,
      event,
      teleformId: input.teleformId,
      data: input.data,
      progress: input.progress,
    });
    return { phase: input.phase, created: false, record };
  } catch (error) {
    if (!(error instanceof AsterMdError) || error.status !== 404) {
      throw error;
    }
    // No submission yet — create then re-apply the intended event.
    await createIntakeSubmission({
      sessionId: input.sessionId,
      event: "intake_initiated",
      teleformId: input.teleformId,
      data: input.data,
      progress: input.progress,
    });
    const record = await updateIntakeSubmission({
      sessionId: input.sessionId,
      event,
      teleformId: input.teleformId,
      data: input.data,
      progress: input.progress,
    });
    return { phase: input.phase, created: true, record };
  }
}

/** @deprecated Prefer syncIntakeSubmission({ phase: "complete" }) */
export async function submitCompletedIntake(input: {
  sessionId: string;
  teleformId: string;
  data: AsterMdIntakeField[];
  progress?: AsterMdIntakeProgress;
}): Promise<{
  created: boolean;
  record: AsterMdIntakeSubmissionRecord;
}> {
  const result = await syncIntakeSubmission({
    phase: "complete",
    ...input,
  });
  return { created: result.created, record: result.record };
}
