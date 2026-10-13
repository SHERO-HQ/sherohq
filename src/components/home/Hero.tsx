import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IllustrationSlot } from "@/components/ui/IllustrationSlot";
import { site, whatsappLink } from "@/content/site";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="py-16 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 id="hero-title" className="text-5xl leading-[1.02] tracking-[-0.035em] sm:text-7xl lg:text-[88px]">
            Redefine
            <br />
            <span className="text-accent">Possible.</span>
          </h1>
          <p className="mt-8 max-w-[34rem] text-lg text-ink-secondary sm:text-xl">
            Software, IT and integrations for businesses in Ghana, with no promises we can&apos;t keep. Plus two
            products of our own, in the making.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Book a free consultation</ButtonLink>
            <ButtonLink href={whatsappLink()} variant="secondary">
              WhatsApp us
            </ButtonLink>
          </div>
          <p className="mt-6 font-mono text-xs text-ink-muted">
            {site.location} · {site.hours.days} {site.hours.open}–{site.hours.close}
          </p>
        </div>
        <IllustrationSlot label="hero scene built around the slanted SHERO shapes" className="aspect-square w-full max-w-md justify-self-center lg:justify-self-end" />
      </Container>
    </section>
  );
}
