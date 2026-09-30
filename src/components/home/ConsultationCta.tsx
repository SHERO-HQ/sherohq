import { ConsultArt } from "@/components/illustrations/ServiceArt";
import { ButtonLink } from "@/components/ui/Button";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { routes, whatsappLink } from "@/lib/site";

const whatsappMessage = "Hi SHERO, I'd like to talk about my business: ";

type ConsultationCtaProps = {
  title?: string;
  body?: string;
};

/**
 * The closing call to action: flat, like the hero it answers. Navy heading,
 * the dot grid rising towards the footer, and a chat that ends in a booked
 * consultation. (The logo's slanted bars stay in the hero, About and the 404.)
 */
export function ConsultationCta({
  title = "Not sure where to start?",
  body = "Tell us what’s slowing your business down. We’ll suggest a practical next step, free.",
}: ConsultationCtaProps) {
  return (
    <section aria-labelledby="cta-heading" className="relative isolate overflow-hidden border-t border-border-subtle">
      <div aria-hidden="true" className="bg-dots mask-fade-up absolute inset-0 -z-10" />
      <div className="container-site grid items-center gap-12 py-section lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-5">
          <h2 id="cta-heading" className="text-h1">
            {title}
          </h2>
          <p className="max-w-measure text-body-lg text-ink-secondary">{body}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={routes.consultation} size="lg" className="group">
              Book a free consultation <InlineArrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href={whatsappLink(whatsappMessage)} variant="secondary" size="lg" external>
              Chat on WhatsApp
            </ButtonLink>
          </div>
        </div>
        {/* Phones keep the section short: words and buttons only. */}
        <ConsultArt className="hidden h-auto w-full max-w-md justify-self-center lg:block" />
      </div>
    </section>
  );
}
