import Link from "next/link";
import { IllustrationSlot } from "@/components/ui/IllustrationSlot";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { services } from "@/content/services";

export function ServicesOverview() {
  return (
    <Section
      id="services"
      tone="surface"
      title="Plain technology work, done properly."
      intro="No pricing guesswork. Tell us what you need and we'll quote."
      action={<TextLink href="/solutions">All solutions</TextLink>}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href ?? `/solutions#${s.id}`}
              className="group flex h-full flex-col rounded-card border border-border bg-surface-raised p-5 transition-colors hover:border-border-strong"
            >
              <IllustrationSlot label={s.name.toLowerCase()} className="mb-5 aspect-[4/3] p-3" />
              <span className="font-mono text-xs text-accent">{s.index}</span>
              <span className="mt-2 font-display text-xl font-semibold text-heading group-hover:underline group-hover:underline-offset-4">
                {s.name}
              </span>
              <span className="mt-2 text-[15px] text-ink-secondary">{s.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
