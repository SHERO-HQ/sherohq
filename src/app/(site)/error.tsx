"use client";

import { LinkRows } from "@/components/ui/LinkRows";
import { business, routes, whatsappLink } from "@/lib/site";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-site flex flex-col gap-5 pt-12 pb-16 lg:gap-7 lg:py-[120px]">
      <p className="font-mono text-[13px]/[17px] font-medium text-accent lg:text-sm/[18px]">something went wrong</p>
      <h1 className="max-w-[760px] font-display text-[38px]/[39px] font-bold tracking-[-0.03em] text-heading lg:text-[72px]/[74px] lg:tracking-[-0.035em]">
        This page didn&rsquo;t load.
      </h1>
      <p className="max-w-[560px] text-[17px]/[26px] text-ink-secondary lg:text-xl/[31px]">
        Try again, or reach us directly on {business.phoneDisplay}.
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-11 self-start rounded-sm bg-primary px-6 text-label text-on-primary hover:bg-primary-hover"
      >
        Try again
      </button>
      <LinkRows
        className="mt-4 max-w-[860px]"
        rows={[
          { title: "Chat on WhatsApp", text: "Tell us what you were trying to do.", href: whatsappLink("Hi SHERO, a page on your site didn't load: "), external: true },
          { title: "Home", text: "Start from the beginning.", href: routes.home },
        ]}
      />
    </section>
  );
}
