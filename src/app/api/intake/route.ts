import { NextRequest, NextResponse } from "next/server";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import {
  getUserFacingMessage,
  normalizeAsterMdError,
} from "@/lib/api/astermd/errors";
import type { IntakeSyncPhase } from "@/lib/api/astermd/intake-submission-types";
import { syncIntakeSubmission } from "@/lib/api/astermd/intake-submissions";
import {
  buildFinalOpportunityCreateBody,
  createOpportunity,
  opportunityRecordId,
  updateOpportunity,
} from "@/lib/api/astermd/opportunities";
import { createSalesSession } from "@/lib/api/astermd/sessions";
import { extractOpportunityPatch } from "@/features/intake/teleform/extract-opportunity-patch";
import { mapTeleformValuesToIntakeFields } from "@/features/intake/teleform/map-values-to-intake-fields";
import { normalizeTeleformJson } from "@/features/intake/teleform/normalize-teleform";
import type { TeleformValues } from "@/features/intake/teleform/types";
import {
  getOpportunityId,
  setOpportunityCookie,
} from "@/lib/session/opportunity-cookie";
import {
  getVisitorSessionId,
  resolveClientIp,
  setVisitorSessionCookie,
} from "@/lib/session/visitor-session";

const NO_STORE = { "Cache-Control": "private, no-store" } as const;

const PHASES = new Set<IntakeSyncPhase>([
  "initiate",
  "progress",
  "complete",
]);

async function ensureVisitorSessionId(request: NextRequest): Promise<string> {
  const existing = await getVisitorSessionId();
  if (existing) return existing;

  const clientIp = resolveClientIp(request);
  const { sessionId } = await createSalesSession({ clientIp });
  await setVisitorSessionCookie(sessionId);
  return sessionId;
}

/**
 * POST — progressive medical intake sync (+ opportunity only on complete).
 *
 * phase:
 * - initiate  → intake create (intake_initiated) only
 * - progress  → intake update (intake_inprogress) only
 * - complete  → intake update (intake_completed) then opportunities/create
 *               with full teleform answers (or update if cookie already set)
 *
 * Never logs answer / opportunity payloads (PHI).
 */
export async function POST(request: NextRequest) {
  try {
    const config = getAsterMdConfig();
    if (
      !config.useMock &&
      (!config.baseUrl || !config.clientId || !config.clientSecret)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "AsterMD credentials are not configured on the server.",
        },
        { status: 503, headers: NO_STORE },
      );
    }

    const teleformId = config.intakeFormId?.trim();
    if (!teleformId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Intake form is not configured on the server.",
        },
        { status: 503, headers: NO_STORE },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      phase?: unknown;
      values?: unknown;
      formDefinition?: unknown;
      page?: unknown;
      totalPages?: unknown;
    };

    const phase = (
      typeof body.phase === "string" ? body.phase.trim().toLowerCase() : ""
    ) as IntakeSyncPhase;

    if (!PHASES.has(phase)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid intake phase. Use initiate, progress, or complete.",
        },
        { status: 400, headers: NO_STORE },
      );
    }

    if (phase !== "initiate") {
      if (!body.values || typeof body.values !== "object") {
        return NextResponse.json(
          { ok: false, error: "Intake answers are required." },
          { status: 400, headers: NO_STORE },
        );
      }
    }

    const values =
      body.values && typeof body.values === "object"
        ? (body.values as TeleformValues)
        : ({} as TeleformValues);

    let data: ReturnType<typeof mapTeleformValuesToIntakeFields> = [];
    let sectionCount = 1;

    if (body.formDefinition) {
      const form = normalizeTeleformJson(body.formDefinition);
      sectionCount = form.sections.length || 1;
      data = mapTeleformValuesToIntakeFields(form, values);
    } else if (phase !== "initiate") {
      return NextResponse.json(
        { ok: false, error: "Intake form definition is required." },
        { status: 400, headers: NO_STORE },
      );
    }

    const totalPages =
      typeof body.totalPages === "number" && body.totalPages > 0
        ? Math.floor(body.totalPages)
        : sectionCount;
    const page =
      typeof body.page === "number" && body.page > 0
        ? Math.floor(body.page)
        : phase === "initiate"
          ? 1
          : totalPages;

    const sessionId = await ensureVisitorSessionId(request);
    const clientIp = resolveClientIp(request);

    const intakeResult = await syncIntakeSubmission({
      phase,
      sessionId,
      teleformId,
      data,
      progress: { page, total: totalPages },
    });

    const submissionId =
      intakeResult.record._id ?? intakeResult.record.id ?? null;

    let opportunityId = await getOpportunityId();
    let opportunityCreated = false;

    if (phase === "complete") {
      const answers = extractOpportunityPatch(values);
      const createBody = buildFinalOpportunityCreateBody({
        sessionId,
        channelId: config.channelId,
        clientIp,
        intakeSubmissionId: submissionId,
        answers,
      });

      if (opportunityId) {
        await updateOpportunity(opportunityId, createBody);
      } else {
        const created = await createOpportunity(createBody);
        opportunityId = opportunityRecordId(created);
        if (!opportunityId) {
          return NextResponse.json(
            {
              ok: false,
              error: "Opportunity was created but no id was returned.",
            },
            { status: 502, headers: NO_STORE },
          );
        }
        await setOpportunityCookie(opportunityId);
        opportunityCreated = true;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        phase: intakeResult.phase,
        sessionId,
        created: intakeResult.created,
        submissionId,
        status: intakeResult.record.status ?? intakeResult.phase,
        opportunityId,
        opportunityCreated,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    console.error(
      "[AsterMD] intake sync error",
      normalized.code,
      normalized.status,
    );
    return NextResponse.json(
      { ok: false, error: getUserFacingMessage(normalized) },
      { status: normalized.status, headers: NO_STORE },
    );
  }
}
