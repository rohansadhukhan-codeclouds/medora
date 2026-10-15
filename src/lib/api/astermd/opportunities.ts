import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import type {
  AsterMdOpportunityApiResponse,
  AsterMdOpportunityRecord,
  AsterMdOpportunityWriteBody,
} from "@/lib/api/astermd/opportunity-types";

const globalState = globalThis as typeof globalThis & {
  __medoraMockOpportunities?: Map<string, AsterMdOpportunityRecord>;
};

function mockStore(): Map<string, AsterMdOpportunityRecord> {
  if (!globalState.__medoraMockOpportunities) {
    globalState.__medoraMockOpportunities = new Map();
  }
  return globalState.__medoraMockOpportunities;
}

function assertId(id: string, label: string): string {
  const trimmed = id.trim();
  if (!trimmed) {
    throw new AsterMdError({
      code: "validation_error",
      message: `AsterMD opportunity requires ${label}`,
      userMessage: "Unable to continue intake. Please refresh and try again.",
    });
  }
  return trimmed;
}

function pendingLeadEmail(sessionId: string): string {
  const slug =
    sessionId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16).toLowerCase() ||
    "guest";
  return `pending.${slug}@example.com`;
}

/**
 * @deprecated Prefer buildFinalOpportunityCreateBody at end of intake.
 * Kept for mocks / recovery only.
 */
export function buildBasicOpportunityCreateBody(input: {
  sessionId: string;
  channelId?: string;
  clientIp?: string | null;
}): AsterMdOpportunityWriteBody {
  const sessionId = assertId(input.sessionId, "session");
  const body: AsterMdOpportunityWriteBody = {
    first_name: "Pending",
    email: pendingLeadEmail(sessionId),
    sessions: [sessionId],
    creation_method: "api",
    business_status: "new",
    status: 1,
    is_archived: false,
    marketing_consent: false,
    communication_consent: false,
  };
  if (input.channelId?.trim()) {
    body.channel_id = input.channelId.trim();
  }
  if (input.clientIp?.trim()) {
    body.attribution = { ip_address: input.clientIp.trim() };
  }
  return body;
}

/**
 * Final opportunity create after intake complete — real teleform answers only.
 * Requires first_name + email (AsterMD SDK).
 */
export function buildFinalOpportunityCreateBody(input: {
  sessionId: string;
  channelId?: string;
  clientIp?: string | null;
  intakeSubmissionId?: string | null;
  answers: AsterMdOpportunityWriteBody;
}): AsterMdOpportunityWriteBody {
  const sessionId = assertId(input.sessionId, "session");
  const firstName = String(input.answers.first_name ?? "").trim();
  const email = String(input.answers.email ?? "").trim().toLowerCase();

  if (!firstName || !email) {
    throw new AsterMdError({
      code: "validation_error",
      message: "Opportunity create requires first_name and email from intake",
      userMessage:
        "Please provide your name and email in the intake form before submitting.",
    });
  }

  const body: AsterMdOpportunityWriteBody = {
    ...input.answers,
    first_name: firstName,
    email,
    sessions: [sessionId],
    creation_method: "api",
    business_status: input.answers.business_status ?? "new",
    status: input.answers.status ?? 1,
    is_archived: input.answers.is_archived ?? false,
  };

  if (input.channelId?.trim()) {
    body.channel_id = input.channelId.trim();
  }
  if (input.intakeSubmissionId) {
    body.intake_submission_ids = [String(input.intakeSubmissionId)];
  }
  if (input.clientIp?.trim()) {
    body.attribution = {
      ...(body.attribution ?? {}),
      ip_address: input.clientIp.trim(),
    };
  }

  return body;
}

/**
 * POST /v1/sales/opportunities/create
 * Do not log body — PHI / PII.
 */
export async function createOpportunity(
  body: AsterMdOpportunityWriteBody,
): Promise<AsterMdOpportunityRecord> {
  const config = getAsterMdConfig();
  const firstName = String(body.first_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!firstName || !email) {
    throw new AsterMdError({
      code: "validation_error",
      message: "Opportunity create requires first_name and email",
      userMessage:
        "Please provide your name and email in the intake form before submitting.",
    });
  }

  const payloadBody: AsterMdOpportunityWriteBody = {
    ...body,
    first_name: firstName,
    email,
  };

  if (config.useMock) {
    const id = `mock-opp-${crypto.randomUUID().slice(0, 8)}`;
    const record: AsterMdOpportunityRecord = {
      ...payloadBody,
      _id: id,
      id,
      opportunity_id: `OID-${id.slice(-6).toUpperCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore().set(id, record);
    return record;
  }

  const payload = await asterMdFetch<AsterMdOpportunityApiResponse>({
    method: "POST",
    path: ASTERMD_ENDPOINTS.opportunitiesCreate,
    body: payloadBody,
  });

  if (!payload.success && payload.message) {
    throw new AsterMdError({
      code:
        payload.message.toLowerCase().includes("unauthorized")
          ? "unauthorized"
          : payload.message.toLowerCase().includes("validation")
            ? "validation_error"
            : "unexpected",
      message: payload.message,
      userMessage:
        payload.message.toLowerCase().includes("unauthorized")
          ? "Please sign in to continue."
          : payload.message.toLowerCase().includes("validation")
            ? "Please check your information and try again."
            : "Unable to save your details. Please try again.",
      details: payload.errors,
    });
  }

  if (!payload.data) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD opportunity create returned no data",
      userMessage: "Unable to save your details. Please try again.",
    });
  }

  return payload.data;
}

/**
 * PUT /v1/sales/opportunities/update/{id}
 * Partial update — only supplied keys change. Do not log body — PHI.
 */
export async function updateOpportunity(
  opportunityId: string,
  body: AsterMdOpportunityWriteBody,
): Promise<AsterMdOpportunityRecord> {
  const config = getAsterMdConfig();
  const id = assertId(opportunityId, "opportunity id");
  const payloadBody: AsterMdOpportunityWriteBody = { ...body };
  if (typeof payloadBody.email === "string") {
    payloadBody.email = payloadBody.email.trim().toLowerCase();
  }

  if (config.useMock) {
    const existing = mockStore().get(id) ?? { _id: id, id };
    const record: AsterMdOpportunityRecord = {
      ...existing,
      ...payloadBody,
      _id: existing._id ?? id,
      updated_at: new Date().toISOString(),
    };
    mockStore().set(id, record);
    return record;
  }

  const payload = await asterMdFetch<AsterMdOpportunityApiResponse>({
    method: "PUT",
    path: ASTERMD_ENDPOINTS.opportunitiesUpdate(id),
    body: payloadBody,
  });

  if (!payload.success && payload.message) {
    throw new AsterMdError({
      code:
        payload.message.toLowerCase().includes("unauthorized")
          ? "unauthorized"
          : payload.message.toLowerCase().includes("validation")
            ? "validation_error"
            : "unexpected",
      message: payload.message,
      userMessage:
        payload.message.toLowerCase().includes("unauthorized")
          ? "Please sign in to continue."
          : payload.message.toLowerCase().includes("validation")
            ? "Please check your information and try again."
            : "Unable to update your intake details. Please try again.",
      details: payload.errors,
    });
  }

  if (!payload.data) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD opportunity update returned no data",
      userMessage: "Unable to update your intake details. Please try again.",
    });
  }

  return payload.data;
}

export function opportunityRecordId(
  record: AsterMdOpportunityRecord | null | undefined,
): string | null {
  if (!record) return null;
  const id = String(record._id ?? record.id ?? "").trim();
  return id || null;
}
