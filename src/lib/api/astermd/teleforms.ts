import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import { getTeleformWithCache } from "@/lib/api/astermd/teleform-cache";
import { normalizeTeleformJson } from "@/features/intake/teleform/normalize-teleform";
import type { NormalizedTeleform } from "@/features/intake/teleform/types";

export type AsterMdTeleformRecord = {
  _id?: string;
  auto_inc_id?: number;
  name?: string;
  type?: string;
  layout?: string;
  form_json_identifier?: string;
  system?: boolean;
  status?: number;
  status_changed_at?: string;
  status_changed_by?: string;
  org_id?: string;
  account_id?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
};

export type AsterMdTeleformViewApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdTeleformRecord;
};

export type AsterMdTeleformViewUrlData = {
  view_url?: string;
  key?: string;
  expires_in?: number;
};

export type AsterMdTeleformViewUrlApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdTeleformViewUrlData;
};

export type TeleformBootstrapResult = {
  teleformId: string;
  teleform: AsterMdTeleformViewApiResponse;
  formJsonIdentifier: string;
  viewUrl: AsterMdTeleformViewUrlApiResponse;
  /** Raw teleform builder JSON from S3. */
  formJson: unknown;
  /** Normalized UI model derived from formJson. */
  form: NormalizedTeleform;
};

export type TeleformBootstrapWithMeta = {
  payload: TeleformBootstrapResult;
  cacheHit: boolean;
  cachedAt: number | null;
  expiresAt: number | null;
};

/**
 * 1) GET /v1/sales/teleforms/view/{id}
 */
export async function viewTeleform(
  teleformId: string,
): Promise<AsterMdTeleformViewApiResponse> {
  const id = teleformId.trim();
  if (!id) {
    throw new AsterMdError({
      code: "validation_error",
      message: "Teleform id is required",
      userMessage: "Intake form configuration is missing.",
    });
  }

  return asterMdFetch<AsterMdTeleformViewApiResponse>({
    method: "GET",
    path: ASTERMD_ENDPOINTS.teleformsView(id),
  });
}

/**
 * 2) GET /v1/sales/teleforms/view-url/{form_json_identifier}
 * Path uses encodeURIComponent so `/` becomes `%2F`.
 */
export async function viewTeleformJsonUrl(
  formJsonIdentifier: string,
): Promise<AsterMdTeleformViewUrlApiResponse> {
  const key = formJsonIdentifier.trim();
  if (!key) {
    throw new AsterMdError({
      code: "validation_error",
      message: "form_json_identifier is required",
      userMessage: "Intake form schema could not be located.",
    });
  }

  return asterMdFetch<AsterMdTeleformViewUrlApiResponse>({
    method: "GET",
    path: ASTERMD_ENDPOINTS.teleformsViewUrl(key),
  });
}

/**
 * 3) GET presigned S3 view_url → teleform builder JSON
 */
export async function fetchTeleformFormJson(
  viewUrl: string,
): Promise<unknown> {
  const url = viewUrl.trim();
  if (!url) {
    throw new AsterMdError({
      code: "validation_error",
      message: "Teleform view_url is missing",
      userMessage: "Intake form schema URL was not returned.",
    });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: `Failed to download teleform JSON: ${
        error instanceof Error ? error.message : "network error"
      }`,
      userMessage: "Intake form schema could not be downloaded.",
    });
  }

  if (!response.ok) {
    throw new AsterMdError({
      code: response.status === 403 || response.status === 404
        ? "not_found"
        : "provider_unavailable",
      status: response.status,
      message: `Teleform JSON download failed with HTTP ${response.status}`,
      userMessage: "Intake form schema download failed.",
    });
  }

  try {
    return await response.json();
  } catch {
    throw new AsterMdError({
      code: "unexpected",
      message: "Teleform JSON response was not valid JSON",
      userMessage: "Intake form schema was unreadable.",
    });
  }
}

async function loadTeleformBootstrap(
  teleformId: string,
): Promise<TeleformBootstrapResult> {
  console.info(
    `[AsterMD] teleform cache miss — fetching GET ${ASTERMD_ENDPOINTS.teleformsView(teleformId)}`,
  );
  const teleform = await viewTeleform(teleformId);
  const formJsonIdentifier = teleform.data?.form_json_identifier?.trim() ?? "";

  if (!formJsonIdentifier) {
    throw new AsterMdError({
      code: "not_found",
      message: "Teleform payload missing form_json_identifier",
      userMessage: "Intake form schema identifier was not returned.",
    });
  }

  console.info(
    `[AsterMD] teleform fetching GET ${ASTERMD_ENDPOINTS.teleformsViewUrl(formJsonIdentifier)}`,
  );
  const viewUrl = await viewTeleformJsonUrl(formJsonIdentifier);
  const signedUrl = viewUrl.data?.view_url?.trim() ?? "";

  console.info("[AsterMD] teleform downloading form JSON from presigned URL");
  const formJson = await fetchTeleformFormJson(signedUrl);
  const form = normalizeTeleformJson(formJson);

  return {
    teleformId,
    teleform,
    formJsonIdentifier,
    viewUrl,
    formJson,
    form,
  };
}

/**
 * Page-open order:
 * 1) teleforms/view/{ASTERMD_INTAKE_FORM_ID}
 * 2) teleforms/view-url/{form_json_identifier}  (%2F-encoded)
 * 3) download form JSON from presigned view_url
 *
 * Bootstrap (including form JSON) is cached server-side for 1 day.
 * Presigned view_url is refreshed when near expiry without re-downloading
 * form JSON when the 1-day entry is still valid.
 */
export async function bootstrapIntakeTeleform(options?: {
  force?: boolean;
}): Promise<TeleformBootstrapWithMeta> {
  const config = getAsterMdConfig();

  if (config.useMock) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "Teleform APIs require live AsterMD (ASTERMD_USE_MOCK=false)",
      userMessage:
        "Intake is unavailable while AsterMD is running in mock mode.",
    });
  }

  if (!config.baseUrl || !config.clientId || !config.clientSecret) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD credentials are not configured",
      userMessage: "Care partner configuration is missing.",
    });
  }

  const teleformId = config.intakeFormId?.trim();
  if (!teleformId) {
    throw new AsterMdError({
      code: "validation_error",
      message: "ASTERMD_INTAKE_FORM_ID is not configured",
      userMessage: "Intake form id is not configured.",
    });
  }

  return getTeleformWithCache(
    teleformId,
    () => loadTeleformBootstrap(teleformId),
    {
      force: options?.force,
      refreshViewUrl: async (cached) => {
        console.info(
          `[AsterMD] teleform refreshing GET ${ASTERMD_ENDPOINTS.teleformsViewUrl(cached.formJsonIdentifier)}`,
        );
        const viewUrl = await viewTeleformJsonUrl(cached.formJsonIdentifier);
        // Keep cached formJson / normalized form — only rotate the signed URL.
        return { ...cached, viewUrl };
      },
    },
  );
}
