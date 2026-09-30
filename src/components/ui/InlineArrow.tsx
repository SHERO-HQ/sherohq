import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Lucide arrow sized to the surrounding text, for links like "Full shop". */
export function InlineArrow({ direction = "right", className }: { direction?: "right" | "down" | "left"; className?: string }) {
  const Icon = { right: ArrowRight, down: ArrowDown, left: ArrowLeft }[direction];
  return (
    <Icon
      aria-hidden="true"
      size="1.1em"
      strokeWidth={1.5}
      className={cn("inline shrink-0 -translate-y-px align-middle", className)}
    />
  );
}
