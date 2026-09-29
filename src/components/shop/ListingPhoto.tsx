import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";

/**
 * A photo of the listed device, or the design's placeholder until the owner
 * adds photos in the admin.
 */
export function ListingPhoto({
  src,
  alt,
  label = "Product photo",
  className,
  priority,
  inCard,
}: {
  src?: string;
  alt: string;
  label?: string;
  className?: string;
  priority?: boolean;
  /** Fills the top of a card: no frame of its own, a rule below. */
  inCard?: boolean;
}) {
  const frame = inCard ? "border-b border-border bg-surface" : "rounded-md border border-border bg-surface";
  if (!src) return <Placeholder label={label} className={cn(frame, className)} />;
  return (
    // TODO(admin phase): switch to next/image once the photo storage host is known.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(frame, "object-cover", className)}
    />
  );
}
