import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site, whatsappLink } from "@/content/site";

export function ClosingCta({ title = "Got something in mind?" }: { title?: string }) {
  return (
    <section aria-labelledby="cta-title" className="pb-16 sm:pb-24">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-card border border-border bg-surface p-8 sm:p-12">
          <div className="max-w-measure">
            <h2 id="cta-title" className="text-3xl tracking-[-0.02em] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-ink-secondary">A real person replies, {site.hours.long}.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact">Book a free consultation</ButtonLink>
            <ButtonLink href={whatsappLink()} variant="secondary">
              WhatsApp us
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
