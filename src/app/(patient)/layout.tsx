import { PatientMobileNav } from "@/components/layout/patient-mobile-nav";
import { PatientSidebar } from "@/components/layout/patient-sidebar";
import { SiteLogo } from "@/components/layout/site-logo";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
          <SiteLogo href="/dashboard" />
        </header>
        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <PatientMobileNav />
      </div>
    </div>
  );
}
