export type DebugApiSource = "AsterMD" | "Internal BFF" | "Payment" | "Other";

export type DebugApiCall = {
  id: string;
  source: DebugApiSource;
  method: string;
  endpoint: string;
  status?: number;
  durationMs: number;
  timestamp: string;
  /** Sanitized request headers (secrets redacted) */
  requestHeaders?: unknown;
  /** Sanitized request body */
  request?: unknown;
  /** Sanitized response body */
  response?: unknown;
  error?: string;
};

export type DevInspectorOverview = {
  environment: "dev" | "prod" | string;
  framework: string;
  react: string;
  language: string;
  styling: string;
  formLib: string;
  networking: string;
  asterMd: "Enabled" | "Disabled" | "Mock";
  payment: string;
};

export type DevInspectorChannelSummary = {
  /** AsterMD path used for this snapshot */
  endpoint: string;
  id?: string;
  name?: string;
  status?: string | number;
  productCount: number;
  products: Array<{
    id?: string;
    name?: string;
    teleformIds?: string[];
  }>;
  paymentIntegrationType?: string;
  cacheHit: boolean;
  cachedAt?: string | null;
  /** Sanitized GET /v1/sales/channels/detail/{id} payload */
  detailResponse?: unknown;
};

export type DevInspectorJourneySummary = {
  sessionIdMasked?: string | null;
  remoteCartIdMasked?: string | null;
  intakeFormIdConfigured: boolean;
  currentPath?: string;
};

export type DevInspectorPayload = {
  overview: DevInspectorOverview;
  channel: DevInspectorChannelSummary | null;
  journey: DevInspectorJourneySummary;
  lastCall: DebugApiCall | null;
  history: DebugApiCall[];
};

export const MAX_DEBUG_HISTORY = 20;
export const MAX_DEBUG_STRING_LENGTH = 2000;
export const DEV_INSPECTOR_COOKIE = "medora_dev_iid";
