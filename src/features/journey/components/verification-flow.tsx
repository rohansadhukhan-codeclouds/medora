"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import { identityVerificationService } from "@/lib/identity/identity-verification-service";

export function VerificationFlow() {
  const router = useRouter();
  const { state, setVerificationStatus, setTreatmentStatus } = useJourney();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state.intakeSubmitted) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Complete intake first</h1>
        <Button onClick={() => router.push("/intake")}>Go to intake</Button>
      </div>
    );
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const session = await identityVerificationService.start();
      setVerificationStatus("in_progress", session.id);
    } catch {
      setError("Unable to start verification. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function completeSuccess() {
    if (!state.verificationSessionId) return;
    setBusy(true);
    await identityVerificationService.markVerified(state.verificationSessionId);
    setVerificationStatus("verified", state.verificationSessionId);
    setTreatmentStatus("provider_review");
    setBusy(false);
    router.push("/review");
  }

  async function completeFail() {
    if (!state.verificationSessionId) {
      const session = await identityVerificationService.start();
      setVerificationStatus("failed", session.id);
      return;
    }
    setBusy(true);
    await identityVerificationService.markFailed(state.verificationSessionId);
    setVerificationStatus("failed", state.verificationSessionId);
    setBusy(false);
  }

  async function retry() {
    if (!state.verificationSessionId) return;
    setBusy(true);
    await identityVerificationService.requestRetry(state.verificationSessionId);
    setVerificationStatus("retry_required", state.verificationSessionId);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <FlowStepper current="verification" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Identity verification
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This step uses IdentityVerificationService. No real KYC vendor is
          connected yet.
        </p>
      </div>

      <div className="border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Status</p>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {state.verificationStatus.replaceAll("_", " ")}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {state.verificationStatus === "not_started" ||
        state.verificationStatus === "retry_required" ? (
          <Button type="button" onClick={() => void start()} disabled={busy}>
            Start verification
          </Button>
        ) : null}
        {state.verificationStatus === "in_progress" ? (
          <>
            <Button
              type="button"
              onClick={() => void completeSuccess()}
              disabled={busy}
            >
              Simulate verified
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void completeFail()}
              disabled={busy}
            >
              Simulate failed
            </Button>
          </>
        ) : null}
        {state.verificationStatus === "failed" ? (
          <Button type="button" onClick={() => void retry()} disabled={busy}>
            Retry required
          </Button>
        ) : null}
        {state.verificationStatus === "verified" ? (
          <Button type="button" onClick={() => router.push("/review")}>
            Continue to provider review
          </Button>
        ) : null}
      </div>
    </div>
  );
}
