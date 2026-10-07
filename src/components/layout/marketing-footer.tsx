import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { marketingNav } from "@/lib/constants/navigation";
import { siteConfig } from "@/config/site";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <SiteLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Convenient online access to licensed healthcare professionals.
            Care decisions are made by providers after reviewing your information.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Explore</h2>
          <ul className="mt-4 space-y-2">
            {marketingNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Patient</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
                Create account
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Patient dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © 2026 {siteConfig.name}. For informational and care
            coordination purposes.
          </p>
          <p>
            This site does not provide emergency care. If you have a medical emergency,
            call 911.
          </p>
        </div>
      </div>
    </footer>
  );
}
