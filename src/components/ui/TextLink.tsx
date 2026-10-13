import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** An inline call-to-action link with an arrow. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 font-medium text-link underline-offset-4 hover:text-link-hover hover:underline",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
