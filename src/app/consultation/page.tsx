import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock, Video } from "lucide-react";
import { Scheduler } from "@/components/booking/Scheduler";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { booking } from "@/content/booking";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Consultation",
  description: "Book a free 30-minute consultation with SHERO about software, hardware or IT support for your business.",
};

export default function ConsultationPage() {
  const { hero, session, framework, schedule } = booking;
  return (
    <>
      <header className="border-b border-border py-14 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className="text-4xl leading-[1.08] tracking-[-0.025em] sm:text-6xl">
              {hero.title[0]}
              <br />
              <span className="text-accent">{hero.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-secondary">{hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#schedule">
                Book a Session <ArrowRight aria-hidden="true" size={16} />
              </ButtonLink>
              <ButtonLink href={whatsappLink("Hi SHERO, I'd like to book a free consultation.")} variant="secondary">
                WhatsApp
              </ButtonLink>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden h-72 lg:block">
            <div className="absolute top-6 right-10 left-0 flex items-start gap-5 rounded-card border border-border bg-surface-raised p-5 shadow-sm">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-surface text-link">
                <CalendarDays size={26} strokeWidth={1.5} />
              </span>
              <span>
                <span className="block font-display text-xl font-semibold text-heading">{session.name}</span>
                <span className="mt-2 flex gap-4 text-sm text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} /> {session.length}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Video size={15} /> {session.format}
                  </span>
                </span>
              </span>
            </div>
            <div className="absolute right-0 bottom-6 left-14 flex items-center justify-between rounded-card border border-border bg-surface p-5">
              <span className="flex items-center gap-4">
                <span className="flex -space-x-3">
                  <span className="z-10 flex size-10 items-center justify-center rounded-full border-2 border-surface bg-accent-subtle text-sm font-semibold text-accent">
                    S
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full border-2 border-surface bg-surface-raised text-xs font-semibold text-link">
                    You
                  </span>
                </span>
                <span className="text-sm font-medium text-ink-secondary">Aligning on architecture…</span>
              </span>
              <span className="size-2 rounded-full bg-accent" />
            </div>
          </div>
        </Container>
      </header>

      <Section id="framework" title={framework.title} intro={framework.body}>
        <ul className="grid gap-4 md:grid-cols-3">
          {framework.topics.map((t, i) => (
            <li key={t.title} className="rounded-card border border-border p-6 sm:p-8">
              <span className="text-sm font-medium text-accent tabular-nums">0{i + 1}</span>
              <h3 className="mt-3 text-xl">{t.title}</h3>
              <p className="mt-2 text-ink-secondary">{t.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="schedule" tone="surface" title={schedule.title} intro={schedule.body}>
        <Scheduler />
      </Section>
    </>
  );
}
