"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { IntakeSection } from "@/features/intake/components/intake-section";
import { IntakeStepper } from "@/features/intake/components/intake-stepper";
import { Field } from "@/features/intake/components/field";
import { submitIntakeAction } from "@/features/intake/actions";
import {
  INTAKE_STEPS,
  defaultIntakeValues,
  intakeFormSchema,
  type IntakeFormValues,
} from "@/features/intake/schemas/intake-schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";

type WizardPhase = "form" | "submitting" | "success" | "error";

export function IntakeWizard() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<WizardPhase>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [intakeId, setIntakeId] = useState<string | null>(null);

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: defaultIntakeValues,
    mode: "onTouched",
  });

  const {
    register,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const values = watch();
  const currentStep = INTAKE_STEPS[step];

  const reviewRows = useMemo(
    () => [
      ["Name", `${values.personal.firstName} ${values.personal.lastName}`],
      ["Date of birth", values.personal.dateOfBirth],
      ["Email", values.contact.email],
      ["Phone", values.contact.phone],
      ["Primary concern", values.healthQuestions.primaryConcern],
    ],
    [values],
  );

  async function handleNext() {
    if (!currentStep || currentStep.id === "review") return;

    const sectionKey = currentStep.id as Exclude<
      typeof currentStep.id,
      "review"
    >;
    const valid = await trigger(sectionKey);
    if (!valid) return;
    setStep((value) => Math.min(value + 1, INTAKE_STEPS.length - 1));
  }

  function handleBack() {
    setStep((value) => Math.max(value - 1, 0));
  }

  async function handleSubmit() {
    setPhase("submitting");
    setErrorMessage(null);

    const result = await submitIntakeAction(getValues());
    if (!result.ok) {
      setPhase("error");
      setErrorMessage(result.message);
      return;
    }

    setIntakeId(result.intakeId);
    setPhase("success");
  }

  if (phase === "success") {
    return (
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-muted text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle>Intake submitted</CardTitle>
          <CardDescription>
            A licensed provider will review your information. You can track status
            from your dashboard.
            {intakeId ? ` Reference: ${intakeId}` : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/messages">View messages</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <IntakeStepper currentStep={step} />

      {phase === "error" && errorMessage ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => {
            setPhase("form");
            setErrorMessage(null);
          }}
        />
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {currentStep?.id === "personal" ? (
            <IntakeSection
              title="Personal information"
              description="Basic details used to identify your patient record."
            >
              <Field
                id="firstName"
                label="First name"
                name="personal.firstName"
                register={register}
                error={errors.personal?.firstName?.message}
              />
              <Field
                id="lastName"
                label="Last name"
                name="personal.lastName"
                register={register}
                error={errors.personal?.lastName?.message}
              />
              <Field
                id="dateOfBirth"
                label="Date of birth"
                name="personal.dateOfBirth"
                type="date"
                register={register}
                error={errors.personal?.dateOfBirth?.message}
              />
              <Field
                id="sexAtBirth"
                label="Sex at birth"
                name="personal.sexAtBirth"
                register={register}
                error={errors.personal?.sexAtBirth?.message}
                placeholder="e.g., Female, Male, Prefer not to say"
              />
            </IntakeSection>
          ) : null}

          {currentStep?.id === "contact" ? (
            <IntakeSection
              title="Contact information"
              description="How your care team can reach you about your visit."
            >
              <Field
                id="email"
                label="Email"
                name="contact.email"
                type="email"
                register={register}
                error={errors.contact?.email?.message}
              />
              <Field
                id="phone"
                label="Phone"
                name="contact.phone"
                register={register}
                error={errors.contact?.phone?.message}
              />
              <Field
                id="addressLine1"
                label="Street address"
                name="contact.addressLine1"
                register={register}
                error={errors.contact?.addressLine1?.message}
                fullWidth
              />
              <Field
                id="city"
                label="City"
                name="contact.city"
                register={register}
                error={errors.contact?.city?.message}
              />
              <Field
                id="state"
                label="State"
                name="contact.state"
                register={register}
                error={errors.contact?.state?.message}
              />
              <Field
                id="postalCode"
                label="ZIP code"
                name="contact.postalCode"
                register={register}
                error={errors.contact?.postalCode?.message}
              />
            </IntakeSection>
          ) : null}

          {currentStep?.id === "medicalHistory" ? (
            <IntakeSection
              title="Medical history"
              description="Share relevant history. Detailed clinical screening will come from finalized requirements."
            >
              <Field
                id="conditions"
                label="Known conditions (optional)"
                name="medicalHistory.conditions"
                register={register}
                multiline
                fullWidth
              />
              <Field
                id="priorSurgeries"
                label="Prior surgeries (optional)"
                name="medicalHistory.priorSurgeries"
                register={register}
                multiline
                fullWidth
              />
              <Field
                id="additionalNotes"
                label="Additional notes (optional)"
                name="medicalHistory.additionalNotes"
                register={register}
                multiline
                fullWidth
              />
            </IntakeSection>
          ) : null}

          {currentStep?.id === "medications" ? (
            <IntakeSection
              title="Current medications"
              description="List medications you currently take, or indicate none."
            >
              <Field
                id="currentMedications"
                label="Medications (optional)"
                name="medications.currentMedications"
                register={register}
                multiline
                fullWidth
              />
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="noMeds"
                  checked={Boolean(values.medications.none)}
                  onCheckedChange={(checked) =>
                    setValue("medications.none", checked === true)
                  }
                />
                <Label htmlFor="noMeds">I am not currently taking medications</Label>
              </div>
            </IntakeSection>
          ) : null}

          {currentStep?.id === "allergies" ? (
            <IntakeSection title="Allergies" description="Share any known allergies.">
              <Field
                id="allergies"
                label="Allergies (optional)"
                name="allergies.allergies"
                register={register}
                multiline
                fullWidth
              />
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="nka"
                  checked={Boolean(values.allergies.noKnownAllergies)}
                  onCheckedChange={(checked) =>
                    setValue("allergies.noKnownAllergies", checked === true)
                  }
                />
                <Label htmlFor="nka">No known allergies</Label>
              </div>
            </IntakeSection>
          ) : null}

          {currentStep?.id === "healthQuestions" ? (
            <IntakeSection
              title="Health questions"
              description="Placeholder questions for architecture. Final clinical content will be configured later."
            >
              <Field
                id="primaryConcern"
                label="What is your primary health concern?"
                name="healthQuestions.primaryConcern"
                register={register}
                error={errors.healthQuestions?.primaryConcern?.message}
                multiline
                fullWidth
              />
              <Field
                id="symptomDuration"
                label="How long has this been going on?"
                name="healthQuestions.symptomDuration"
                register={register}
                error={errors.healthQuestions?.symptomDuration?.message}
                fullWidth
              />
            </IntakeSection>
          ) : null}

          {currentStep?.id === "consent" ? (
            <IntakeSection
              title="Consent"
              description="Please review and acknowledge before submitting."
            >
              <ConsentRow
                id="telehealthConsent"
                checked={Boolean(values.consent.telehealthConsent)}
                error={errors.consent?.telehealthConsent?.message}
                label="I consent to receiving care through a telehealth visit when appropriate."
                onChange={(checked) =>
                  setValue("consent.telehealthConsent", checked, {
                    shouldValidate: true,
                  })
                }
              />
              <ConsentRow
                id="privacyAcknowledgement"
                checked={Boolean(values.consent.privacyAcknowledgement)}
                error={errors.consent?.privacyAcknowledgement?.message}
                label="I acknowledge that my information will be handled according to Medora’s privacy practices and shared with licensed providers as needed for care."
                onChange={(checked) =>
                  setValue("consent.privacyAcknowledgement", checked, {
                    shouldValidate: true,
                  })
                }
              />
              <ConsentRow
                id="accuracyAcknowledgement"
                checked={Boolean(values.consent.accuracyAcknowledgement)}
                error={errors.consent?.accuracyAcknowledgement?.message}
                label="I confirm the information I provided is accurate to the best of my knowledge."
                onChange={(checked) =>
                  setValue("consent.accuracyAcknowledgement", checked, {
                    shouldValidate: true,
                  })
                }
              />
            </IntakeSection>
          ) : null}

          {currentStep?.id === "review" ? (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Review & submit
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Confirm your details before sending them for provider review.
                  Submission does not guarantee a diagnosis, treatment, or
                  prescription.
                </p>
              </div>
              <dl className="divide-y divide-border rounded-xl border border-border">
                {reviewRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr]"
                  >
                    <dt className="text-sm font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-sm text-foreground">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 0 || phase === "submitting"}
            >
              Back
            </Button>
            {currentStep?.id === "review" ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={phase === "submitting"}
              >
                {phase === "submitting" ? "Submitting…" : "Submit intake"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConsentRow({
  id,
  label,
  checked,
  error,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onChange(value === true)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Label htmlFor={id} className="leading-relaxed">
          {label}
        </Label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
