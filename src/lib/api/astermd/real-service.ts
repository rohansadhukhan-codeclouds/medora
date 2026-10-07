import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINT_PLACEHOLDERS } from "@/lib/api/astermd/endpoints";
import { AsterMdError, normalizeAsterMdError } from "@/lib/api/astermd/errors";
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

/**
 * RealAsterMdService — skeleton for production AsterMD HTTP integration.
 *
 * IMPORTANT:
 * - Endpoint paths are placeholders until official docs are provided.
 * - Do not hardcode credentials; they come from server env.
 * - Never import this module into Client Components.
 */
export class RealAsterMdService implements AsterMdService {
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    void path;
    void init;
    const config = getAsterMdConfig();

    if (!config.baseUrl || !config.apiKey) {
      throw new AsterMdError({
        code: "provider_unavailable",
        message: "AsterMD credentials are not configured",
        userMessage:
          "Our care partner is temporarily unavailable. Please try again shortly.",
      });
    }

    // TODO(security): Add request signing / auth headers per AsterMD docs.
    // TODO(integration): Replace placeholder paths with documented endpoints.
    // TODO(observability): Log correlation IDs without PHI.
    throw new AsterMdError({
      code: "provider_unavailable",
      message:
        "RealAsterMdService is not connected yet. Provide AsterMD API documentation to implement endpoints.",
      userMessage:
        "Our care partner is temporarily unavailable. Please try again shortly.",
      details: {
        placeholderEndpoints: ASTERMD_ENDPOINT_PLACEHOLDERS,
      },
    });
  }

  createPatient(input: CreatePatientInput): Promise<Patient> {
    void input;
    return this.request<Patient>(ASTERMD_ENDPOINT_PLACEHOLDERS.patients, {
      method: "POST",
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getPatient(patientId: string): Promise<Patient> {
    return this.request<Patient>(
      ASTERMD_ENDPOINT_PLACEHOLDERS.patientById(patientId),
    ).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  updatePatient(patientId: string, input: UpdatePatientInput): Promise<Patient> {
    void input;
    return this.request<Patient>(
      ASTERMD_ENDPOINT_PLACEHOLDERS.patientById(patientId),
      { method: "PATCH" },
    ).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  createIntake(input: CreateIntakeInput): Promise<Intake> {
    void input;
    return this.request<Intake>(ASTERMD_ENDPOINT_PLACEHOLDERS.intakes, {
      method: "POST",
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getIntake(intakeId: string): Promise<Intake> {
    return this.request<Intake>(
      ASTERMD_ENDPOINT_PLACEHOLDERS.intakeById(intakeId),
    ).catch((error) => {
      throw normalizeAsterMdError(error);
    });
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
    void input;
    return this.request<Appointment>(ASTERMD_ENDPOINT_PLACEHOLDERS.appointments, {
      method: "POST",
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getAppointments(patientId: string): Promise<Appointment[]> {
    void patientId;
    return this.request<Appointment[]>(ASTERMD_ENDPOINT_PLACEHOLDERS.appointments).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  getPrescriptions(patientId: string): Promise<Prescription[]> {
    void patientId;
    return this.request<Prescription[]>(
      ASTERMD_ENDPOINT_PLACEHOLDERS.prescriptions,
    ).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getConversations(patientId: string): Promise<Conversation[]> {
    void patientId;
    return this.request<Conversation[]>(
      ASTERMD_ENDPOINT_PLACEHOLDERS.conversations,
    ).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getMessages(conversationId: string): Promise<Message[]> {
    void conversationId;
    return this.request<Message[]>(ASTERMD_ENDPOINT_PLACEHOLDERS.messages).catch(
      (error) => {
        throw normalizeAsterMdError(error);
      },
    );
  }

  sendMessage(input: SendMessageInput): Promise<Message> {
    void input;
    return this.request<Message>(ASTERMD_ENDPOINT_PLACEHOLDERS.messages, {
      method: "POST",
    }).catch((error) => {
      throw normalizeAsterMdError(error);
    });
  }

  getProviderStatus(): Promise<ProviderStatus> {
    return this.request<ProviderStatus>(
      ASTERMD_ENDPOINT_PLACEHOLDERS.providerStatus,
    ).catch((error) => {
      throw normalizeAsterMdError(error);
    });
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
