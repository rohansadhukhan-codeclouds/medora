import type {
  Appointment,
  Conversation,
  CreateAppointmentInput,
  CreateIntakeInput,
  CreatePatientInput,
  Intake,
  Message,
  Patient,
  PatientDashboard,
  Prescription,
  ProviderStatus,
  SendMessageInput,
  UpdatePatientInput,
} from "@/lib/api/astermd/types";

/**
 * AsterMdService — integration contract.
 * UI and route handlers depend on this interface only.
 * Swap MockAsterMdService → RealAsterMdService without UI changes.
 */
export interface AsterMdService {
  createPatient(input: CreatePatientInput): Promise<Patient>;
  getPatient(patientId: string): Promise<Patient>;
  updatePatient(patientId: string, input: UpdatePatientInput): Promise<Patient>;

  createIntake(input: CreateIntakeInput): Promise<Intake>;
  getIntake(intakeId: string): Promise<Intake>;
  getIntakeByPatient(patientId: string): Promise<Intake | null>;

  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
  getAppointments(patientId: string): Promise<Appointment[]>;

  getPrescriptions(patientId: string): Promise<Prescription[]>;

  getConversations(patientId: string): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: SendMessageInput): Promise<Message>;

  getProviderStatus(): Promise<ProviderStatus>;
  getPatientDashboard(patientId: string): Promise<PatientDashboard>;
}
