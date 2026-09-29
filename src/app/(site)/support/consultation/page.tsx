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
    <section className="container-site grid gap-8 pt-8 pb-16 lg:grid-cols-2 lg:items-start lg:gap-24 lg:pt-[88px] lg:pb-28">
      <div className="flex flex-col gap-5 lg:gap-7">
        <h1 className="font-display text-4xl/[38px] font-bold tracking-[-0.03em] text-heading lg:text-[64px]/[66px] lg:tracking-[-0.035em]">
          Book a free consultation.
        </h1>
        <p className="max-w-[540px] text-[17px]/[26px] text-ink-secondary lg:text-xl/[31px]">
          Tell us what&rsquo;s slowing your business down. We&rsquo;ll suggest a practical next step, whether
          that&rsquo;s software, hardware or just advice.
        </p>
        <ol className="lg:mt-2">
          {steps.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[36px_1fr] gap-4 border-t border-border py-4 lg:py-5">
              <span className="font-mono text-sm/6 font-medium text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex flex-col gap-1">
                <span className="font-display text-[19px]/[26px] font-semibold text-heading">{step.title}</span>
                <span className="text-[15px]/[23px] text-ink-secondary lg:text-base/[25px]">{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-1 border-t border-border pt-5">
          <span className="text-sm/5 text-ink-secondary">Prefer to call or WhatsApp?</span>
          <span className="flex flex-wrap gap-x-4 font-display text-xl/7 font-semibold text-heading">
            <a href={`tel:${business.phoneE164}`} className="hover:underline">
              {business.phoneDisplay}
            </a>
            <a
              href={whatsappLink("Hi SHERO, I'd like to book a consultation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-text text-sm/7 font-medium text-primary hover:underline"
            >
              WhatsApp us
            </a>
          </span>
          <span className="font-mono text-[13px]/[18px] text-ink-muted">mon–fri, 8:00 am – 6:00 pm</span>
        </div>
      </div>

      {/* The fallback keeps the form in the static HTML; the preset applies once loaded. */}
      <Suspense fallback={<ConsultationForm />}>
        <ConsultationFormWithPreset />
      </Suspense>
    </section>
  );
}
