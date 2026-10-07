import { LoginForm } from "@/features/auth/login-form";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to your Medora Health patient account.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginForm />;
}
