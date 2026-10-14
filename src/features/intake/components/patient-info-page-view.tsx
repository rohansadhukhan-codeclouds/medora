"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2, UserRound, X } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/features/intake/components/field";
import {
  hasTeleformDraft,
  readIntakeDraft,
  savePatientInfoDraft,
} from "@/features/intake/draft-storage";
import { useEmailVerify } from "@/features/intake/hooks/use-email-verify";
import {
  PATIENT_TITLE_OPTIONS,
  emptyPatientInfoValues,
  patientInfoSchema,
  type PatientInfoValues,
} from "@/features/intake/schemas/patient-info-schema";
import { cn } from "@/lib/utils/cn";

export function PatientInfoPageView() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [savedHint, setSavedHint] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<PatientInfoValues>({
    resolver: zodResolver(patientInfoSchema),
    mode: "onChange",
    defaultValues: emptyPatientInfoValues,
  });

  const emailValue = watch("email");
  const emailVerify = useEmailVerify(emailValue ?? "");
  const canCheckout = isValid && emailVerify.isVerified;

  useEffect(() => {
    if (!hasTeleformDraft()) {
      router.replace("/intake");
      return;
    }
    const draft = readIntakeDraft();
    if (draft?.patientInfo) {
      reset(draft.patientInfo);
      void trigger();
    }
    setReady(true);
  }, [reset, router, trigger]);

  const onSaveAndHold = (values: PatientInfoValues) => {
    if (!emailVerify.isVerified) return;
    savePatientInfoDraft(values);
    setSavedHint(true);
    // Static for now — checkout API sequence comes in a later phase.
  };

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--secondary)_16%,transparent),_transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
        <Reveal trigger="mount">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
            <Link href="/intake">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to intake
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-muted text-primary">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">Your details</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Information
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Tell us how to reach you. Checkout unlocks after these fields are
                complete and your email is verified.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal trigger="mount">
          <form
            className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            onSubmit={handleSubmit(onSaveAndHold)}
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient-title">Title</Label>
                <select
                  id="patient-title"
                  className={cn(
                    "flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground",
                    "outline-none focus:outline-none focus-visible:outline-none focus:border-input focus-visible:border-input",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    errors.title && "border-destructive",
                  )}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "patient-title-error" : undefined
                  }
                  {...register("title")}
                >
                  <option value="">Select title</option>
                  {PATIENT_TITLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.title ? (
                  <p
                    id="patient-title-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <Field<PatientInfoValues>
                id="patient-name"
                label="Name"
                name="name"
                register={register}
                error={errors.name?.message}
                placeholder="Full name"
              />

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="patient-email">Email</Label>
                <div className="relative">
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={
                      emailVerify.status === "invalid" ||
                      emailVerify.status === "failed"
                    }
                    aria-describedby="patient-email-status"
                    aria-busy={emailVerify.status === "checking"}
                    className={cn(
                      "pr-10",
                      emailVerify.status === "valid" && "border-success",
                      (emailVerify.status === "invalid" ||
                        emailVerify.status === "failed") &&
                        "border-destructive",
                    )}
                    {...register("email")}
                  />
                  {emailVerify.status === "checking" ? (
                    <Loader2
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                      aria-label="Verifying email"
                    />
                  ) : null}
                  {emailVerify.status === "valid" ? (
                    <Check
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-success"
                      strokeWidth={2.5}
                      aria-label="Email verified"
                    />
                  ) : null}
                  {emailVerify.status === "invalid" ||
                  emailVerify.status === "failed" ? (
                    <X
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-destructive"
                      strokeWidth={2.5}
                      aria-label="Invalid email"
                    />
                  ) : null}
                </div>
                {emailVerify.message && emailVerify.status !== "checking" ? (
                  <p
                    id="patient-email-status"
                    role="status"
                    className={cn(
                      "text-sm",
                      (emailVerify.status === "invalid" ||
                        emailVerify.status === "failed") &&
                        "text-destructive",
                      emailVerify.status === "unknown" &&
                        "text-muted-foreground",
                    )}
                  >
                    {emailVerify.message}
                  </p>
                ) : (
                  <span id="patient-email-status" className="sr-only">
                    {emailVerify.status === "checking"
                      ? "Verifying email"
                      : null}
                  </span>
                )}
              </div>

              <Field<PatientInfoValues>
                id="patient-phone"
                label="Phone"
                name="phone"
                type="tel"
                register={register}
                error={errors.phone?.message}
                placeholder="Phone number"
              />

              <Field<PatientInfoValues>
                id="patient-dateOfBirth"
                label="Date of birth"
                name="dateOfBirth"
                type="date"
                register={register}
                error={errors.dateOfBirth?.message}
              />

              <Field<PatientInfoValues>
                id="patient-address"
                label="Address"
                name="address"
                register={register}
                error={errors.address?.message}
                placeholder="Street, city, state, ZIP"
                multiline
                fullWidth
              />
            </div>

            <div className="border-t border-border pt-6">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!canCheckout}
              >
                Go to checkout
              </Button>
              {savedHint ? (
                <p className="mt-3 text-sm text-muted-foreground" role="status">
                  Details saved. Checkout connection comes in the next phase —
                  no payment action yet.
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Complete all fields and verify your email to enable checkout.
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
