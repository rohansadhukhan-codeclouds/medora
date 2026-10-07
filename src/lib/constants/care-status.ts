import type { CareStatus } from "@/lib/api/astermd/types";

export const CARE_STATUS_LABELS: Record<CareStatus, string> = {
  intake_not_started: "Intake not started",
  intake_in_progress: "Intake in progress",
  submitted: "Submitted",
  under_provider_review: "Under provider review",
  more_information_needed: "More information needed",
  completed: "Completed",
};

export const CARE_STATUS_DESCRIPTIONS: Record<CareStatus, string> = {
  intake_not_started:
    "Start your health intake so a licensed provider can review your information.",
  intake_in_progress:
    "Continue your intake when you are ready. Your progress is saved for this session.",
  submitted:
    "Your intake has been submitted and is waiting for provider review.",
  under_provider_review:
    "A licensed provider is reviewing your information. No action is needed right now.",
  more_information_needed:
    "Your care team needs a bit more information before continuing.",
  completed:
    "Your current care review is complete. Check treatments and messages for updates.",
};
