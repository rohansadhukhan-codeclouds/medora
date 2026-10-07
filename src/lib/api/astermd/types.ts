/**
 * Domain types for Medora ↔ AsterMD integration contracts.
 * These are application-facing shapes. Mappers will translate real AsterMD
 * payloads into these types once official API documentation is available.
 *
 * Do NOT invent AsterMD wire-format field names here as "real" schema.
 */

export type CareStatus =
  | "intake_not_started"
  | "intake_in_progress"
  | "submitted"
  | "under_provider_review"
  | "more_information_needed"
  | "completed";

export type AppointmentStatus =
  | "requested"
  | "scheduled"
  | "completed"
  | "cancelled";

export type PrescriptionStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

export type MessageSender = "patient" | "provider" | "system";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  careStatus: CareStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface IntakeSectionAnswer {
  sectionId: string;
  values: Record<string, unknown>;
}

export interface Intake {
  id: string;
  patientId: string;
  status: "draft" | "submitted" | "under_review" | "needs_info" | "completed";
  sections: IntakeSectionAnswer[];
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntakeInput {
  patientId: string;
  sections: IntakeSectionAnswer[];
}

export interface Appointment {
  id: string;
  patientId: string;
  providerName: string;
  scheduledAt: string;
  status: AppointmentStatus;
  type: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  type: string;
  preferredAt?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicationName: string;
  providerName: string;
  status: PrescriptionStatus;
  instructions: string;
  lastUpdatedAt: string;
}

export interface Conversation {
  id: string;
  patientId: string;
  subject: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  body: string;
  createdAt: string;
}

export interface SendMessageInput {
  conversationId: string;
  body: string;
}

export interface ProviderStatus {
  available: boolean;
  message: string;
  checkedAt: string;
}

export interface PatientDashboard {
  patient: Patient;
  upcomingAppointment: Appointment | null;
  prescriptions: Prescription[];
  conversations: Conversation[];
  documents: PatientDocument[];
}

export interface PatientDocument {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
}
