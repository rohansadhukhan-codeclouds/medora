import Link from "next/link";
import {
  ClipboardCheck,
  Lock,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const trustItems = [
  "Licensed healthcare professionals",
  "Secure patient experience",
  "Clear, step-by-step care journey",
];

const steps = [
  {
    title: "Tell us about your health",
    description:
      "Complete a guided intake so your care team understands your needs.",
  },
  {
    title: "A licensed provider reviews your information",
    description:
      "Your submission is reviewed by a licensed healthcare professional.",
  },
  {
    title: "Receive your personalized care plan if appropriate",
    description:
      "If clinically appropriate, you may receive next steps, guidance, or treatment information.",
  },
];

const treatments = [
  {
    title: "Everyday care",
    description: "Support for common concerns through a convenient online visit.",
  },
  {
    title: "Follow-up care",
    description: "Continue conversations with your care team after your intake.",
  },
  {
    title: "Treatment review",
    description:
      "Providers review your information before recommending any next steps.",
  },
  {
    title: "Care coordination",
    description: "Track appointments, messages, and documents in one place.",
  },
];

const reasons = [
  {
    icon: Stethoscope,
    title: "Convenient online access",
    description: "Start from home and move through care at a pace that fits your life.",
  },
  {
    icon: Lock,
    title: "Secure patient experience",
    description:
      "Sensitive information is handled through server-side integrations designed for privacy.",
  },
  {
    icon: UserRoundCheck,
    title: "Licensed healthcare professionals",
    description:
      "Care decisions are made by licensed providers after reviewing your information.",
  },
  {
    icon: ClipboardCheck,
    title: "Transparent patient journey",
    description:
      "Know where you are in the process—from intake through provider review and follow-up.",
  },
];

const faqs = [
  {
    q: "Is Medora a replacement for emergency care?",
    a: "No. Medora is not for emergencies. If you are experiencing a medical emergency, call 911 or go to the nearest emergency room.",
  },
  {
    q: "Will I automatically receive a prescription?",
    a: "No. A prescription is never guaranteed. A licensed provider reviews your information and determines whether treatment is appropriate.",
  },
  {
    q: "How does the intake process work?",
    a: "You answer guided questions about your health. Your responses are submitted for provider review. Additional information may be requested when needed.",
  },
  {
    q: "Who provides the care?",
    a: "Care is delivered through licensed healthcare professionals via our provider partner workflows.",
  },
];

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-muted),transparent_45%),linear-gradient(180deg,var(--background),#eef3f6)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Medora Health
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
              Healthcare that fits your life.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Convenient online access to licensed healthcare professionals.
              Share your health information, get a thoughtful provider review,
              and receive personalized next steps when appropriate.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/treatments">Explore Treatments</Link>
              </Button>
            </div>
            <ul className="mt-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {trustItems.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-primary">Patient journey</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              A calmer path to care
            </h2>
            <ol className="mt-6 space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="How Medora works"
          title="Three clear steps from intake to care guidance"
          description="We keep the journey modular so provider workflows can evolve without changing how patients move through care."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <p className="text-sm font-semibold text-primary">
                  Step {index + 1}
                </p>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="Treatments"
            title="Care categories designed around real patient needs"
            description="Browse areas where Medora can help you get started. Specific offerings may vary based on clinical appropriateness and provider availability."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {treatments.map((item) => (
              <Card key={item.title} className="bg-background">
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/treatments">View all treatments</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="Why Medora"
          title="Built for trust, clarity, and calm"
          description="A modern patient experience without the noise of generic healthcare marketing."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            title="Answers before you begin"
            description="Responsible healthcare starts with clear expectations."
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
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,var(--primary-muted),var(--card)_55%)] px-6 py-12 text-center sm:px-10">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Ready when you are
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Create your account, complete your intake, and let a licensed provider
            review your information. No guaranteed outcomes—just a clear path
            forward.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
