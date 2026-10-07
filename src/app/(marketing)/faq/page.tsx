import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Frequently asked questions about Medora Health and the patient journey.",
  path: "/faq",
});

const faqs = [
  {
    q: "Does Medora diagnose or prescribe automatically?",
    a: "No. Medora does not automate diagnosis or prescriptions. Licensed providers review your information and decide next steps.",
  },
  {
    q: "What happens after I submit my intake?",
    a: "Your intake moves into provider review. You can track status from your dashboard and respond if more information is needed.",
  },
  {
    q: "Is my information shared with AsterMD?",
    a: "Patient workflows are designed to integrate with AsterMD through Medora’s secure server layer. Exact data flows will follow finalized API and privacy requirements.",
  },
  {
    q: "Can I message my care team?",
    a: "Yes. Messaging is available in your patient portal so you can communicate about your care when appropriate.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Common questions"
        description="Clear answers with responsible healthcare wording."
        as="h1"
      />
      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
