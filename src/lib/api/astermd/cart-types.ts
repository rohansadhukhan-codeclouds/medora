/**
 * AsterMD sales cart types (client-safe).
 * Create: POST /v1/sales/carts/create
 * Update: PUT  /v1/sales/carts/update/{sessionUuid}
 * View:   GET  /v1/sales/carts/view/{sessionUuid}
 */

export type AsterMdCartLine = {
  product_id: string;
  name: string;
  qty: number;
};

export type AsterMdCartRecord = {
  _id?: string;
  session?: string;
  status?: string;
  status_changed_at?: string | null;
  status_changed_by?: string | null;
  items?: AsterMdCartLine[];
  channel_id?: string;
  org_id?: string;
  account_id?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  [key: string]: unknown;
};

export type AsterMdCartApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdCartRecord | null;
  errors?: Record<string, unknown>;
};

export type CreateAsterMdCartBody = {
  session: string;
  items: AsterMdCartLine[];
};

export type UpdateAsterMdCartBody = {
  items: AsterMdCartLine[];
};
