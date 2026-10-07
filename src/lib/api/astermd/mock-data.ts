import type {
  Appointment,
  Conversation,
  Intake,
  Message,
  Patient,
  PatientDocument,
  Prescription,
} from "@/lib/api/astermd/types";

/** Demo patient used across mock flows. Not real PHI. */
export const MOCK_PATIENT_ID = "pat_demo_001";

export const mockPatient: Patient = {
  id: MOCK_PATIENT_ID,
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex.morgan@example.com",
  phone: "(555) 010-2048",
  dateOfBirth: "1990-04-12",
  careStatus: "under_provider_review",
  createdAt: "2026-09-01T14:00:00.000Z",
  updatedAt: "2026-10-06T18:30:00.000Z",
};

export const mockIntake: Intake = {
  id: "int_demo_001",
  patientId: MOCK_PATIENT_ID,
  status: "under_review",
  sections: [
    {
      sectionId: "personal",
      values: {
        firstName: "Alex",
        lastName: "Morgan",
        dateOfBirth: "1990-04-12",
      },
    },
  ],
  submittedAt: "2026-10-05T16:00:00.000Z",
  createdAt: "2026-10-04T12:00:00.000Z",
  updatedAt: "2026-10-05T16:00:00.000Z",
};

export const mockAppointments: Appointment[] = [
  {
    id: "apt_001",
    patientId: MOCK_PATIENT_ID,
    providerName: "Dr. Jordan Lee",
    scheduledAt: "2026-10-12T15:00:00.000Z",
    status: "scheduled",
    type: "Video follow-up",
    notes: "Discuss care plan updates",
    createdAt: "2026-10-06T10:00:00.000Z",
    updatedAt: "2026-10-06T10:00:00.000Z",
  },
  {
    id: "apt_002",
    patientId: MOCK_PATIENT_ID,
    providerName: "Dr. Jordan Lee",
    scheduledAt: "2026-09-20T14:00:00.000Z",
    status: "completed",
    type: "Initial consultation",
    createdAt: "2026-09-10T09:00:00.000Z",
    updatedAt: "2026-09-20T15:00:00.000Z",
  },
  {
    id: "apt_003",
    patientId: MOCK_PATIENT_ID,
    providerName: "Care Coordination",
    scheduledAt: "2026-09-01T11:00:00.000Z",
    status: "cancelled",
    type: "Intake clarification",
    createdAt: "2026-08-28T09:00:00.000Z",
    updatedAt: "2026-08-30T12:00:00.000Z",
  },
];

export const mockPrescriptions: Prescription[] = [
  {
    id: "rx_001",
    patientId: MOCK_PATIENT_ID,
    medicationName: "Example Medication A",
    providerName: "Dr. Jordan Lee",
    status: "active",
    instructions: "Take as directed by your provider. Displayed from API data only.",
    lastUpdatedAt: "2026-10-06T12:00:00.000Z",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv_001",
    patientId: MOCK_PATIENT_ID,
    subject: "Care plan questions",
    lastMessagePreview: "Thank you — we will follow up after review.",
    lastMessageAt: "2026-10-06T17:45:00.000Z",
    unreadCount: 1,
  },
  {
    id: "conv_002",
    patientId: MOCK_PATIENT_ID,
    subject: "Intake clarification",
    lastMessagePreview: "Please confirm your preferred pharmacy.",
    lastMessageAt: "2026-10-04T13:20:00.000Z",
    unreadCount: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
  conv_001: [
    {
      id: "msg_001",
      conversationId: "conv_001",
      sender: "patient",
      body: "I have a question about next steps after my intake was submitted.",
      createdAt: "2026-10-06T16:00:00.000Z",
    },
    {
      id: "msg_002",
      conversationId: "conv_001",
      sender: "provider",
      body: "Thank you — we will follow up after review.",
      createdAt: "2026-10-06T17:45:00.000Z",
    },
  ],
  conv_002: [
    {
      id: "msg_003",
      conversationId: "conv_002",
      sender: "provider",
      body: "Please confirm your preferred pharmacy.",
      createdAt: "2026-10-04T13:20:00.000Z",
    },
  ],
};

export const mockDocuments: PatientDocument[] = [
  {
    id: "doc_001",
    title: "Submitted intake summary",
    type: "Intake",
    updatedAt: "2026-10-05T16:05:00.000Z",
  },
  {
    id: "doc_002",
    title: "Consent acknowledgment",
    type: "Consent",
    updatedAt: "2026-10-05T15:55:00.000Z",
  },
];
