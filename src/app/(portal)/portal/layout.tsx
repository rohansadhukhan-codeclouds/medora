import { redirect } from "next/navigation";

export const instant = false;

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  void children;
  redirect("/account");
}
