import "server-only";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";
import type { AsterMdService } from "@/lib/api/astermd/service";
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

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

/**
 * RealAsterMdService — AsterMD HTTP integration.
 * All calls use the authenticated server-side http client (Bearer JWT).
 */
export class RealAsterMdService implements AsterMdService {
  private async request<T>(
    path: string,
    init?: { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown },
  ): Promise<T> {
    const payload = await asterMdFetch<Envelope<T> | T>({
      path,
      method: init?.method ?? "GET",
      body: init?.body,
    });

    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as Envelope<T>).data as T;
    }

    return payload as T;
  }

  createPatient(input: CreatePatientInput): Promise<Patient> {
    return this.request<Patient>(ASTERMD_ENDPOINTS.patients, {
      method: "POST",
      body: input,
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getPatient(patientId: string): Promise<Patient> {
    return this.request<Patient>(ASTERMD_ENDPOINTS.patientById(patientId)).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  updatePatient(patientId: string, input: UpdatePatientInput): Promise<Patient> {
    return this.request<Patient>(ASTERMD_ENDPOINTS.patientById(patientId), {
      method: "PATCH",
      body: input,
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  createIntake(input: CreateIntakeInput): Promise<Intake> {
    return this.request<Intake>(ASTERMD_ENDPOINTS.intakes, {
      method: "POST",
      body: input,
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getIntake(intakeId: string): Promise<Intake> {
    return this.request<Intake>(ASTERMD_ENDPOINTS.intakeById(intakeId)).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  getIntakeByPatient(patientId: string): Promise<Intake | null> {
    void patientId;
    return Promise.reject(
      normalizeAsterMdError(
        new AsterMdError({
          code: "provider_unavailable",
          message: "getIntakeByPatient not implemented for real AsterMD yet",
          userMessage:
            "Our care partner is temporarily unavailable. Please try again shortly.",
        }),
      ),
    );
  }

  createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    return this.request<Appointment>(ASTERMD_ENDPOINTS.appointments, {
      method: "POST",
      body: input,
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getAppointments(patientId: string): Promise<Appointment[]> {
    void patientId;
    return this.request<Appointment[]>(ASTERMD_ENDPOINTS.appointments).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  getPrescriptions(patientId: string): Promise<Prescription[]> {
    void patientId;
    return this.request<Prescription[]>(ASTERMD_ENDPOINTS.prescriptions).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  getConversations(patientId: string): Promise<Conversation[]> {
    void patientId;
    return this.request<Conversation[]>(ASTERMD_ENDPOINTS.conversations).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  getMessages(conversationId: string): Promise<Message[]> {
    void conversationId;
    return this.request<Message[]>(ASTERMD_ENDPOINTS.messages).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  sendMessage(input: SendMessageInput): Promise<Message> {
    return this.request<Message>(ASTERMD_ENDPOINTS.messages, {
      method: "POST",
      body: input,
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getProviderStatus(): Promise<ProviderStatus> {
    return this.request<ProviderStatus>(ASTERMD_ENDPOINTS.providerStatus).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  getPatientDashboard(patientId: string): Promise<PatientDashboard> {
    void patientId;
    return Promise.reject(
      normalizeAsterMdError(
        new AsterMdError({
          code: "provider_unavailable",
          message: "getPatientDashboard not implemented for real AsterMD yet",
          userMessage:
            "Our care partner is temporarily unavailable. Please try again shortly.",
        }),
      ),
    );
  }
}
