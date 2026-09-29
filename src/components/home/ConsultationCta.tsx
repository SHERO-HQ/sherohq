import Link from "next/link";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

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
      <section className="flex flex-col gap-6 rounded-md bg-navy-700 p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-12">
        <div className="flex max-w-measure flex-col gap-3">
          <h2 className="text-h2 text-ink-inverse">{title}</h2>
          <p className="text-body-lg text-navy-100">{body}</p>
        </div>
        <Link
          href={routes.consultation}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-sm bg-ink-inverse px-5 text-label whitespace-nowrap text-navy-700 transition-colors duration-150 hover:bg-navy-50 focus-visible:outline-ink-inverse lg:self-auto"
        >
          Book a free consultation <InlineArrow />
        </Link>
      </section>
    </div>
  );
}
