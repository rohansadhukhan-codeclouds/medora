import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import type {
  AsterMdSessionCreateApiResponse,
  AsterMdSessionViewApiResponse,
  AsterMdSessionViewEntry,
  AsterMdSessionViewMap,
} from "@/lib/api/astermd/session-types";

export type CreateSalesSessionInput = {
  channelId?: string;
  /** Visitor IP forwarded to AsterMD as X-Original-Client-Ip */
  clientIp?: string | null;
};

export type ViewSalesSessionsInput = {
  sessionIds: string[];
  /** IANA timezone for created_at conversion (e.g. Asia/Kolkata) */
  tz?: string;
};

function extractSessionId(
  payload: AsterMdSessionCreateApiResponse,
): string | null {
  const fromData =
    typeof payload.data?.session === "string" ? payload.data.session.trim() : "";
  if (fromData) return fromData;

  const fromRoot =
    typeof payload.session === "string" ? payload.session.trim() : "";
  if (fromRoot) return fromRoot;

  return null;
}

/**
 * POST /v1/sales/sessions/create
 * Creates a visitor sales session + initial visit_page journey event.
 * Not cached — every create is intentional.
 */
export async function createSalesSession(
  input: CreateSalesSessionInput = {},
): Promise<{ sessionId: string; payload: AsterMdSessionCreateApiResponse }> {
  const config = getAsterMdConfig();
  const channelId = input.channelId ?? config.channelId;

  if (!config.baseUrl || !config.clientId || !config.clientSecret) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD credentials are not configured",
      userMessage:
        "Our care partner is temporarily unavailable. Please try again shortly.",
    });
  }

  if (!channelId) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD channel id is not configured",
      userMessage: "Channel configuration is missing.",
    });
  }

  if (config.useMock) {
    const sessionId = `mock-session-${Date.now()}`;
    return {
      sessionId,
      payload: {
        success: true,
        message: "Mock session created",
        data: {
          session: sessionId,
          channel_id: channelId,
        },
      },
    };
  }

  const headers: Record<string, string> = {};
  const clientIp = input.clientIp?.trim();
  if (clientIp) {
    headers["X-Original-Client-Ip"] = clientIp;
  }

  const payload = await asterMdFetch<AsterMdSessionCreateApiResponse>({
    method: "POST",
    path: ASTERMD_ENDPOINTS.sessionsCreate,
    body: { channel_id: channelId },
    headers,
  });

  const sessionId = extractSessionId(payload);
  if (!sessionId) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD session create response missing session UUID",
      userMessage: "Unable to start your browsing session. Please try again.",
      details: payload,
    });
  }

  return { sessionId, payload };
}

/**
 * GET /v1/sales/sessions/view?session_ids=...
 * Returns journey timelines keyed by session UUID. Not cached.
 */
export async function viewSalesSessions(
  input: ViewSalesSessionsInput,
): Promise<AsterMdSessionViewMap> {
  const config = getAsterMdConfig();
  const sessionIds = input.sessionIds
    .map((id) => id.trim())
    .filter(Boolean);

  if (sessionIds.length === 0) {
    throw new AsterMdError({
      code: "validation_error",
      message: "session_ids is required",
      userMessage: "Session id is missing.",
    });
  }

  if (config.useMock) {
    const map: AsterMdSessionViewMap = {};
    for (const id of sessionIds) {
      map[id] = {
        data: { session: id, mock: true },
        events: [
          {
            event: "visit_page",
            data: { page_name: "index" },
            created_at: new Date().toISOString(),
          },
        ],
      };
    }
    return map;
  }

  const params = new URLSearchParams({
    session_ids: sessionIds.join(","),
  });
  if (input.tz?.trim()) {
    params.set("tz", input.tz.trim());
  }

  const payload = await asterMdFetch<
    AsterMdSessionViewApiResponse | AsterMdSessionViewMap
  >({
    method: "GET",
    path: `${ASTERMD_ENDPOINTS.sessionsView}?${params.toString()}`,
  });

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as AsterMdSessionViewApiResponse).data;
    if (data && typeof data === "object") {
      return data;
    }
  }

  // Some responses may return the map at the root.
  if (payload && typeof payload === "object") {
    const asMap = payload as AsterMdSessionViewMap;
    const hit = sessionIds.find((id) => id in asMap);
    if (hit) {
      return asMap;
    }
  }

  throw new AsterMdError({
    code: "not_found",
    message: "AsterMD session view returned no session data",
    userMessage: "Unable to load session details.",
    details: payload,
  });
}

export async function viewSalesSession(
  sessionId: string,
  tz?: string,
): Promise<AsterMdSessionViewEntry | null> {
  const map = await viewSalesSessions({ sessionIds: [sessionId], tz });
  return map[sessionId] ?? null;
}
