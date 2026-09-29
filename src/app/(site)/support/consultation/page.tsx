import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsultationForm, ConsultationFormWithPreset } from "@/components/forms/ConsultationForm";
import { business, routes, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a free consultation",
  description:
    "Tell SHERO what's slowing your business down and get a practical next step, free. Software, hardware or IT support, in Tamale and across Ghana.",
  alternates: { canonical: routes.consultation },
};

const steps = [
  { title: "You tell us what you need", text: "A few details here, or just a sentence about the problem." },
  { title: "We get in touch", text: "By phone, WhatsApp or email, Monday to Friday." },
  {
    title: "We talk it through",
    text: "A short call, free and with no obligation. We suggest a practical next step and, if it makes sense, a clear quote.",
  },
];

export default function ConsultationPage() {
  return (
    <section className="container-site grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-24 py-section">
      <div className="flex flex-col gap-5 lg:gap-7">
        <h1 className="font-display text-h1 text-heading">
          Book a free consultation.
        </h1>
        <p className="max-w-measure text-body-lg text-ink-secondary">
          Tell us what&rsquo;s slowing your business down. We&rsquo;ll suggest a practical next step, whether
          that&rsquo;s software, hardware or just advice.
        </p>
        <ol className="lg:mt-2">
          {steps.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[36px_1fr] gap-4 border-t border-border py-4 lg:py-5">
              <span className="font-mono text-body-sm font-medium text-secondary">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex flex-col gap-1">
                <span className="font-display text-body-lg font-semibold text-heading">{step.title}</span>
                <span className="text-body text-ink-secondary">{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-1 border-t border-border pt-5">
          <span className="text-body-sm text-ink-secondary">Prefer to call or WhatsApp?</span>
          <span className="flex flex-wrap gap-x-4 font-display text-h3 text-heading">
            <a href={`tel:${business.phoneE164}`} className="hover:underline">
              {business.phoneDisplay}
            </a>
            <a
              href={whatsappLink("Hi SHERO, I'd like to book a consultation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-text text-body-sm font-medium text-primary hover:underline"
            >
              WhatsApp us
            </a>
          </span>
          <span className="font-mono text-meta text-ink-muted">mon–fri, 8:00 am – 6:00 pm</span>
        </div>
      </div>

      {/* The fallback keeps the form in the static HTML; the preset applies once loaded. */}
      <Suspense fallback={<ConsultationForm />}>
        <ConsultationFormWithPreset />
      </Suspense>
    </section>
  );
}
