/**
 * AsterMD opportunities create/update shapes (dashboard OpenAPI + SDK).
 * Contact / clinical / identity / addresses are PHI — never log full bodies.
 */

export type AsterMdOpportunityAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_default?: boolean;
};

export type AsterMdOpportunityClinical = {
  height?: { value?: number; unit?: string };
  weight?: { value?: number; unit?: string };
  bmi?: number;
  allergies?: string[];
  medications?: string[];
};

export type AsterMdOpportunityIdentity = {
  verified?: boolean;
  method?: string;
  provider?: string;
  reference_id?: string;
  result?: string;
  verified_at?: string;
};

export type AsterMdOpportunityAttribution = {
  source?: { category?: string; detail?: string };
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  c1?: string;
  c2?: string;
  c3?: string;
  c4?: string;
  c5?: string;
  affiliate_id?: string;
  ip_address?: string;
  geo?: { city?: string; state?: string; country?: string };
  device_type?: string;
  browser?: string;
  os?: string;
  referrer_url?: string;
};

/** Create / partial-update request body. */
export type AsterMdOpportunityWriteBody = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  email_validation?: string;
  sessions?: string[];
  tags?: string[];
  static_segment_ids?: string[];
  notes?: string;
  business_status?: string;
  is_archived?: boolean;
  marketing_consent?: boolean;
  communication_consent?: boolean;
  status?: number;
  dob?: string;
  gender?: string;
  clinical?: AsterMdOpportunityClinical;
  identity?: AsterMdOpportunityIdentity;
  addresses?: AsterMdOpportunityAddress[];
  intake_submission_ids?: string[];
  channel_id?: string;
  creation_method?: string;
  attribution?: AsterMdOpportunityAttribution;
  meta?: Record<string, unknown>;
};

export type AsterMdOpportunityRecord = AsterMdOpportunityWriteBody & {
  _id?: string;
  id?: string;
  opportunity_id?: string;
  converted_patient_id?: string | null;
  converted_at?: string | null;
  org_id?: string;
  account_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AsterMdOpportunityApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdOpportunityRecord;
  errors?: Record<string, unknown>;
};
