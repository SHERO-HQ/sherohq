import { cn } from "@/lib/cn";

/** Mono section label, e.g. "// what we do". One per section. */
export function Eyebrow({ children, className }: { children: string; className?: string }) {
  return (
    <p className={cn("font-mono text-xs font-medium tracking-[0.02em] text-accent", className)}>
      {"// "}
      {children}
    </p>
  );
}
