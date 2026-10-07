import { RegisterForm } from "@/features/auth/register-form";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Create account",
  description: "Create your Medora Health patient account and begin intake.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
