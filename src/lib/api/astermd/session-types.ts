/**
 * AsterMD sales session types (client-safe).
 * Create: POST /v1/sales/sessions/create
 * View:   GET  /v1/sales/sessions/view?session_ids=...
 */

export type AsterMdSessionJourneyEvent = {
  event?: string;
  created_at?: string;
  data?: {
    page_name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type AsterMdSessionViewEntry = {
  data?: Record<string, unknown>;
  events?: AsterMdSessionJourneyEvent[];
  [key: string]: unknown;
};

/** Response map keyed by session UUID. */
export type AsterMdSessionViewMap = Record<string, AsterMdSessionViewEntry>;

export type AsterMdSessionCreateApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    session?: string;
    _id?: string;
    channel_id?: string;
    [key: string]: unknown;
  } | null;
  /** Some payloads may put the UUID on the root. */
  session?: string;
};

export type AsterMdSessionViewApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdSessionViewMap | null;
};
