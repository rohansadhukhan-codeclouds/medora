import { PatientInfoPageView } from "@/features/intake/components/patient-info-page-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Your information",
  description:
    "Share your contact details after completing the Medora Health medical intake.",
  path: "/intake/information",
});

export default function IntakeInformationPage() {
  return <PatientInfoPageView />;
}
