import type { Metadata } from "next";
import { Code2, Compass, Flag, Gauge, Laptop, LifeBuoy, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StoryArt } from "@/components/illustrations";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { about } from "@/content/about";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `SHERO builds what moves businesses forward: software, hardware and IT support from ${site.location}.`,
};

const pillarIcons = { hardware: Laptop, software: Code2, "managed-it": LifeBuoy } as const;
const valueIcons = [Compass, ShieldCheck, Flag, Gauge] as const;

export default function AboutPage() {
  return (
    <>
      {/* Hero: the owner will replace this later. */}
      <header className="border-b border-border py-14 sm:py-24">
        <Container>
          <h1 className="max-w-4xl text-4xl leading-[1.08] tracking-[-0.025em] sm:text-6xl">{about.title}</h1>
          <div className="mt-6 max-w-2xl space-y-4 text-lg text-ink-secondary">
            {about.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact-us">Work With Us</ButtonLink>
            <ButtonLink href="/consultation" variant="secondary">
              Book Consultation
            </ButtonLink>
          </div>
        </Container>
      </header>

      <Section id="pillars" className="pb-0 sm:pb-0">
        <h2 className="sr-only">What we do</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {about.pillars.map((p) => {
            const Icon = pillarIcons[p.id];
            return (
              <li key={p.id} className="flex flex-col rounded-card border border-border bg-surface-raised p-6 sm:p-8">
                <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="text-accent" />
                <h3 className="mt-6 text-2xl tracking-[-0.015em]">{p.name}</h3>
                <p className="text-sm text-ink-muted">{p.label}</p>
                <p className="mt-3 text-ink-secondary">{p.body}</p>
                <TextLink href={`/consultation?service=${p.id}#schedule`} className="mt-auto pt-6">
                  {p.cta}
                </TextLink>
              </li>
            );
          })}
        </ul>
      </Section>

      <Container className="py-16 sm:py-24">
        <figure className="mx-auto max-w-3xl border-l-2 border-accent pl-6 sm:pl-10">
          <blockquote className="font-display text-2xl leading-snug font-medium tracking-[-0.015em] text-heading sm:text-4xl">
            “{about.quote.text}”
          </blockquote>
          <figcaption className="mt-5 text-sm text-ink-muted">{about.quote.by}</figcaption>
        </figure>
      </Container>

      <Section id="story" tone="surface">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-card border border-border bg-page p-6 sm:p-10">
            <StoryArt />
          </div>
          <div>
            <h2 id="story-title" className="text-[26px] leading-tight tracking-[-0.015em] sm:text-4xl">
              {about.story.title}
            </h2>
            <div className="mt-5 space-y-4 text-lg text-ink-secondary">
              {about.story.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            ["Our Mission", about.story.mission],
            ["Our Vision", about.story.vision],
          ].map(([title, body]) => (
            <div key={title} className="rounded-card border border-border bg-surface-raised p-6 sm:p-8">
              <h3 className="text-xl">{title}</h3>
              <p className="mt-3 text-ink-secondary">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <h3 className="text-2xl tracking-[-0.015em]">What Sets Us Apart</h3>
          <dl className="mt-6 grid gap-8 md:grid-cols-3">
            {about.apart.map((a) => (
              <div key={a.title} className="border-t border-border pt-5">
                <dt className="font-display text-lg font-semibold text-heading">{a.title}</dt>
                <dd className="mt-2 text-ink-secondary">{a.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="values" title={about.values.title} intro={about.values.intro}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {about.values.items.map((v, i) => {
            const Icon = valueIcons[i] ?? Compass;
            return (
              <li key={v.title} className="rounded-card border border-border p-6 sm:p-8">
                <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="text-accent" />
                <h3 className="mt-5 text-2xl tracking-[-0.015em]">{v.title}</h3>
                <p className="mt-3 text-ink-secondary">{v.body}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      <section aria-labelledby="about-cta" className="pb-16 sm:pb-24">
        <Container>
          <div className="rounded-card bg-surface-inverse p-8 text-ink-inverse sm:p-14">
            <h2 id="about-cta" className="max-w-2xl text-3xl tracking-[-0.02em] text-ink-inverse sm:text-5xl">
              {about.cta.title}
            </h2>
            <p className="mt-4 max-w-measure text-lg text-ink-inverse-muted">{about.cta.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact-us">Let&apos;s Build Together</ButtonLink>
              <ButtonLink href="/consultation" variant="inverse">
                Book a Consultation
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
