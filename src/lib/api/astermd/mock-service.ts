import "server-only";
import { AsterMdError } from "@/lib/api/astermd/errors";
import type { AsterMdService } from "@/lib/api/astermd/service";
import {
  MOCK_PATIENT_ID,
  mockAppointments,
  mockConversations,
  mockDocuments,
  mockIntake,
  mockMessages,
  mockPatient,
  mockPrescriptions,
} from "@/lib/api/astermd/mock-data";
import type {
  Appointment,
  CreateAppointmentInput,
  CreateIntakeInput,
  CreatePatientInput,
  Intake,
  Message,
  Patient,
  SendMessageInput,
  UpdatePatientInput,
} from "@/lib/api/astermd/types";

function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clonePatient(patient: Patient): Patient {
  return { ...patient };
}

/**
 * In-memory mock implementing the AsterMdService contract.
 * Replace with RealAsterMdService when AsterMD credentials + docs are ready.
 */
export class MockAsterMdService implements AsterMdService {
  private patients = new Map<string, Patient>([[MOCK_PATIENT_ID, { ...mockPatient }]]);
  private intakes = new Map<string, Intake>([[mockIntake.id, { ...mockIntake }]]);
  private appointments = [...mockAppointments];
  private messages = structuredClone(mockMessages);

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    await delay();
    const now = new Date().toISOString();
    const patient: Patient = {
      id: `pat_${crypto.randomUUID().slice(0, 8)}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      careStatus: "intake_not_started",
      createdAt: now,
      updatedAt: now,
    };
    this.patients.set(patient.id, patient);
    return clonePatient(patient);
  }

  async getPatient(patientId: string): Promise<Patient> {
    await delay();
    const patient = this.patients.get(patientId);
    if (!patient) {
      throw new AsterMdError({
        code: "patient_not_found",
        message: `Patient ${patientId} not found`,
        userMessage: "We could not find your patient record.",
      });
    }
    return clonePatient(patient);
  }

  async updatePatient(
    patientId: string,
    input: UpdatePatientInput,
  ): Promise<Patient> {
    await delay();
    const patient = await this.getPatient(patientId);
    const updated: Patient = {
      ...patient,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.patients.set(patientId, updated);
    return clonePatient(updated);
  }

  async createIntake(input: CreateIntakeInput): Promise<Intake> {
    await delay();
    const now = new Date().toISOString();
    const intake: Intake = {
      id: `int_${crypto.randomUUID().slice(0, 8)}`,
      patientId: input.patientId,
      status: "submitted",
      sections: input.sections,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.intakes.set(intake.id, intake);

    const patient = this.patients.get(input.patientId);
    if (patient) {
      this.patients.set(input.patientId, {
        ...patient,
        careStatus: "submitted",
        updatedAt: now,
      });
    }

    return { ...intake, sections: [...intake.sections] };
  }

  async getIntake(intakeId: string): Promise<Intake> {
    await delay();
    const intake = this.intakes.get(intakeId);
    if (!intake) {
      throw new AsterMdError({
        code: "not_found",
        message: `Intake ${intakeId} not found`,
        userMessage: "The requested information could not be found.",
      });
    }
    return { ...intake, sections: [...intake.sections] };
  }

  async getIntakeByPatient(patientId: string): Promise<Intake | null> {
    await delay();
    const intake = [...this.intakes.values()].find((item) => item.patientId === patientId);
    return intake ? { ...intake, sections: [...intake.sections] } : null;
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    await delay();
    const now = new Date().toISOString();
    const appointment: Appointment = {
      id: `apt_${crypto.randomUUID().slice(0, 8)}`,
      patientId: input.patientId,
      providerName: "Provider assignment pending",
      scheduledAt: input.preferredAt ?? now,
      status: "requested",
      type: input.type,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.unshift(appointment);
    return { ...appointment };
  }

  async getAppointments(patientId: string): Promise<Appointment[]> {
    await delay();
    return this.appointments
      .filter((item) => item.patientId === patientId)
      .map((item) => ({ ...item }));
  }

  async getPrescriptions(patientId: string) {
    await delay();
    return mockPrescriptions
      .filter((item) => item.patientId === patientId)
      .map((item) => ({ ...item }));
  }

  async getConversations(patientId: string) {
    await delay();
    return mockConversations
      .filter((item) => item.patientId === patientId)
      .map((item) => ({ ...item }));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay();
    return (this.messages[conversationId] ?? []).map((item) => ({ ...item }));
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    await delay();
    const message: Message = {
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      conversationId: input.conversationId,
      sender: "patient",
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    const thread = this.messages[input.conversationId] ?? [];
    thread.push(message);
    this.messages[input.conversationId] = thread;
    return { ...message };
  }

  async getProviderStatus() {
    await delay(80);
    return {
      available: true,
      message: "Licensed providers are reviewing submissions during business hours.",
      checkedAt: new Date().toISOString(),
    };
  }

  async getPatientDashboard(patientId: string) {
    const [patient, appointments, prescriptions, conversations] = await Promise.all([
      this.getPatient(patientId),
      this.getAppointments(patientId),
      this.getPrescriptions(patientId),
      this.getConversations(patientId),
    ]);

    const upcomingAppointment =
      appointments.find((item) => item.status === "scheduled" || item.status === "requested") ??
      null;

    return {
      patient,
      upcomingAppointment,
      prescriptions,
      conversations,
      documents: mockDocuments.map((item) => ({ ...item })),
    };
  }
}
