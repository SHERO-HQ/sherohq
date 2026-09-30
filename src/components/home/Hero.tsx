import { HeroArt } from "@/components/illustrations/ServiceArt";
import { ButtonLink } from "@/components/ui/Button";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { routes } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden lg:flex lg:flex-1 lg:items-center">
      {/* A faint dot grid, fading downwards: texture without a glow. */}
      <div aria-hidden="true" className="bg-dots mask-fade-down absolute inset-x-0 top-0 -z-10 h-160" />

      <div className="container-site grid items-center gap-12 pt-section pb-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-12">
        <div className="flex flex-col items-start gap-6">
          {/* Clerk-style announcement pill incorporating the logo's slanted bars */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-3.5 py-1 text-meta text-ink-secondary shadow-xs">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="slant h-3.5 w-7 bg-navy-700" />
              <span className="slant h-3.5 w-3.5 bg-emerald-700" />
            </span>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <span>Technology &amp; IT · Tamale &amp; Nationwide</span>
          </div>
          {/* The motto appears only here, on About and in the footer. */}
          <h1 className="text-display">Redefine Possible.</h1>
          <p className="max-w-measure text-body-lg text-ink-secondary">
            SHERO builds software, supplies tested laptops and supports the technology businesses run on. Based in
            Tamale, working with clients in Ghana and beyond.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={routes.shop} size="lg" className="group">
              Shop laptops <InlineArrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href={routes.consultation} variant="outline" size="lg">
              Book a free consultation
            </ButtonLink>
          </div>
        </div>
        <HeroArt className="mx-auto h-auto w-full max-w-md lg:max-w-lg 2xl:max-w-xl" />
      </div>
    </section>
  );
}
