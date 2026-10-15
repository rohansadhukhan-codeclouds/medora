/**
 * AsterMD intake-submissions payload shapes (official PHP SDK).
 * `data` and response `contact` are PHI — never log them.
 */

export type AsterMdIntakeEvent =
  | "pre_qualifying_initiated"
  | "pre_qualifying_inprogress"
  | "pre_qualifying_completed"
  | "intake_initiated"
  | "intake_inprogress"
  | "intake_completed";

/** Client/BFF progressive sync phases (maps to AsterMdIntakeEvent). */
export type IntakeSyncPhase = "initiate" | "progress" | "complete";

export type AsterMdIntakeFieldValue = {
  value: string | boolean | number;
  label?: string;
  url?: string;
};

export type AsterMdIntakeField = {
  id: string;
  name: string;
  label: string;
  type: string;
  value: AsterMdIntakeFieldValue[];
};

export type AsterMdIntakeProgress = {
  page: number;
  total: number;
};

export type CreateAsterMdIntakeSubmissionBody = {
  session: string;
  event: AsterMdIntakeEvent;
  teleform_id: string;
  data: AsterMdIntakeField[];
  progress?: AsterMdIntakeProgress;
};

export type UpdateAsterMdIntakeSubmissionBody = CreateAsterMdIntakeSubmissionBody;

export type AsterMdIntakeSubmissionRecord = {
  _id?: string;
  id?: string;
  session?: string;
  teleform_id?: string;
  status?: string;
  /** Latest journey event for this session/teleform (view). */
  event?: AsterMdIntakeEvent | string;
  progress?: AsterMdIntakeProgress;
  /** PHI — do not log. */
  data?: AsterMdIntakeField[];
  /** PHI — do not log. */
  contact?: Record<string, unknown>;
};

export type AsterMdIntakeSubmissionApiResponse = {
  success?: boolean;
  message?: string;
  /** Null when no matching record exists (view does not 404). */
  data?: AsterMdIntakeSubmissionRecord | null;
};
