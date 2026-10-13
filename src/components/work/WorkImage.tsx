import Image from "next/image";
import type { WorkItem } from "@/content/types";
import { cn } from "@/lib/cn";

/** The project's screenshot or mark, framed on a quiet surface so any image size sits well. */
export function WorkImage({ item, sizes, priority, className }: { item: WorkItem; sizes: string; priority?: boolean; className?: string }) {
  const contain = item.image.fit === "contain";
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={item.image.src.endsWith(".svg")}
        className={cn(contain ? "object-contain p-[12%]" : "object-cover object-top")}
      />
    </div>
  );
}
