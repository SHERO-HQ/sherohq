import Link from "next/link";
import { cn } from "@/lib/cn";

const base = "flex flex-col overflow-hidden rounded-md border border-border bg-surface-raised";
const interactive = "transition-colors duration-150 hover:border-border-strong";

/** The one card style: a bordered panel on the raised surface. */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn(base, className)}>{children}</div>;
}

/** A whole card that is one link. */
export function CardLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(base, interactive, "group", className)}>
      {children}
    </Link>
  );
}

/** Artwork or a photo across the top of a card, on the surface tone. */
export function CardMedia({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border-b border-border bg-surface", className)}>{children}</div>;
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex flex-1 flex-col gap-2 p-5 lg:p-6", className)}>{children}</div>;
}
