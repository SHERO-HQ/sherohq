import { HeroArt } from "@/components/illustrations/ServiceArt";
import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden lg:flex lg:flex-1 lg:items-center">
      {/* The illustrations' dot grid, fading out from the top: depth without a picture. */}
      <div aria-hidden="true" className="bg-dots mask-fade-down absolute inset-x-0 top-0 -z-10 h-160" />

      <div className="container-site grid items-center gap-12 pt-section pb-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-12">
        <div className="flex flex-col items-start gap-6">
          {/* The logo's slanted bars, in the fixed brand inks. */}
          <div aria-hidden="true" className="flex gap-2">
            <span className="slant h-4 w-14 bg-navy-700" />
            <span className="slant h-4 w-8 bg-emerald-700" />
          </div>
          {/* The motto appears only here, on About and in the footer. */}
          <h1 className="text-display">Redefine Possible.</h1>
          <p className="max-w-measure text-body-lg text-ink-secondary">
            SHERO builds software, supplies tested laptops and supports the technology businesses run on. From Tamale,
            delivering across Ghana.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={routes.shop} size="lg">
              Shop laptops
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
