import { Section, SectionHeader } from "@/components/ui/Section";
import type { PublicTestimonial } from "@/lib/testimonials";

/** In clients' own words. Shown only once three real, consented ones are published. */
export function Testimonials({ items }: { items: PublicTestimonial[] }) {
  if (items.length === 0) return null;
  return (
    <Section divider aria-labelledby="testimonials-heading">
      <SectionHeader id="testimonials-heading" title="In our clients' words." />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {items.slice(0, 3).map((t) => (
          <li key={t.id}>
            <figure className="flex h-full flex-col justify-between gap-6 rounded-md border border-border bg-surface-raised p-6">
              <blockquote className="text-body-lg text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="text-body-sm text-ink-secondary">
                <span className="font-medium text-ink">{t.attribution}</span>
                {t.business && <>, {t.business}</>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
