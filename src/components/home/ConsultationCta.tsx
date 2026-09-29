import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { routes, whatsappLink } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

const whatsappMessage = "Hi SHERO, I'd like to talk about my business: ";

type ConsultationCtaProps = {
  title?: string;
  body?: string;
};

export function ConsultationCta({
  title = "Not sure where to start?",
  body = "Tell us what’s slowing your business down. We’ll suggest a practical next step, free.",
}: ConsultationCtaProps) {
  return (
    <div className="container-site pb-section">
      {/* Stays logo navy in both themes. */}
      <section className="relative isolate flex flex-col gap-6 overflow-hidden rounded-md bg-navy-700 p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-12">
        {/* The hero's dot grid in a lighter navy, fading in towards the buttons. */}
        <div aria-hidden="true" className="bg-dots-inverse mask-fade-left absolute inset-y-0 right-0 -z-10 w-2/3" />
        <div className="flex max-w-measure flex-col gap-3">
          <h2 className="text-h2 text-ink-inverse">{title}</h2>
          <p className="text-body-lg text-navy-100">{body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href={routes.consultation}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-ink-inverse px-5 text-label whitespace-nowrap text-navy-700 transition-colors duration-150 hover:bg-navy-50 focus-visible:outline-ink-inverse"
          >
            Book a free consultation <InlineArrow />
          </Link>
          <ButtonLink href={whatsappLink(whatsappMessage)} variant="secondary" size="lg" external>
            Chat on WhatsApp
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
