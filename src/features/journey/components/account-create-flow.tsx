"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import { authService } from "@/lib/auth/auth-service";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Values = z.infer<typeof schema>;

export function AccountCreateFlow() {
  const router = useRouter();
  const { state, createAccount } = useJourney();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: state.patient.email,
      phone: state.patient.phone,
      password: "",
    },
  });

  async function onSubmit(values: Values) {
    await authService.register({
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
    createAccount({ email: values.email, phone: values.phone });
    router.push("/plan");
  }

  if (state.eligibilityStatus !== "eligible") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Complete eligibility first</h1>
        <Button onClick={() => router.push("/eligibility")}>
          Go to eligibility
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FlowStepper current="account" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account creation is abstracted behind AuthService. A real identity
          provider or AsterMD auth can replace the mock later.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
