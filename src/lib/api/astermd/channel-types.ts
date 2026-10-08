/**
 * AsterMD channel detail types (client-safe).
 * Matches GET /v1/sales/channels/detail/{id} response shape.
 */

export type AsterMdNamedRef = {
  _id?: string;
  name?: string;
};

export type AsterMdProductVariant = {
  _id?: string;
  name?: string;
  sku?: string;
  description?: string;
  default_price?: number | null;
  intro_price?: number | null;
  sale_price?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
};

export type AsterMdProductPricing = {
  default_price?: number | null;
  intro_price?: number | null;
  sale_price?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
};

export type AsterMdChannelProductDetails = {
  _id?: string;
  product_id?: string;
  status?: number;
  name?: string;
  sku?: string;
  description_short?: string;
  description_long?: string;
  type?: string;
  visibility?: string;
  image?: string;
  stock?: number;
  min_buy_qty?: number;
  max_buy_qty?: number;
  categories?: AsterMdNamedRef[];
  condition_treated?: AsterMdNamedRef[];
  labtest?: Array<string | AsterMdChannelProductDetails>;
  teleforms?: Array<string | AsterMdNamedRef>;
  variants?: AsterMdProductVariant[];
  single?: AsterMdProductPricing[];
  org_id?: string;
  account_id?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  status_changed_at?: string | null;
  status_changed_by?: string | null;
  restrict_multiple?: boolean;
  renewal_teleforms?: AsterMdNamedRef[];
};

export type AsterMdProductMapping = {
  _id?: string;
  type?: string;
  product_id?: string;
  variant_id?: string;
  integration?: {
    type?: string;
    integration_id?: string;
  };
  mapping?: {
    type?: string;
    product_id?: string;
    product_name?: string;
    offer_id?: string;
    offer_name?: string;
    variant_id?: string;
  };
  countries?: Array<{
    key?: string;
    values?: string[];
  }>;
  status?: number;
};

export type AsterMdChannelProduct = {
  _id?: string;
  channel_id?: string;
  product_id?: string;
  variant_ids?: string[];
  add_ons?: AsterMdChannelProductDetails[];
  product?: AsterMdChannelProductDetails;
  product_mappings?: AsterMdProductMapping[];
};

export type AsterMdPaymentProcessor = {
  _id?: string;
  name?: string;
  provider_category?: string;
  type?: string;
  status?: number;
  config?: Record<string, unknown>;
};

export type AsterMdChannelDetail = {
  _id: string;
  description?: string;
  status?: number;
  name?: string;
  type?: string;
  auto_inc_id?: number;
  payment_processor?: AsterMdPaymentProcessor | null;
  products?: AsterMdChannelProduct[];
};

export type AsterMdChannelDetailApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdChannelDetail;
  meta?: unknown;
  error?: unknown;
  request_id?: string;
};

export type ChannelLoadStatus = "idle" | "loading" | "success" | "error";
