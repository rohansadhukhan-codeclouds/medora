import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type SiteLogoProps = {
  className?: string;
  href?: string;
};

export function SiteLogo({ className, href = "/" }: SiteLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
      >
        M
      </span>
      <span className="text-lg">
        Medora <span className="font-normal text-muted-foreground">Health</span>
      </span>
    </Link>
  );
}
