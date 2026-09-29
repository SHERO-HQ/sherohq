"use client";

import { LinkRows } from "@/components/ui/LinkRows";
import { buttonClass } from "@/components/ui/Button";
import { business, routes, whatsappLink } from "@/lib/site";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-site flex flex-col gap-5 lg:gap-7 py-section py-section">
      <p className="font-mono text-meta lg:text-body-sm font-medium text-secondary">something went wrong</p>
      <h1 className="max-w-measure font-display text-h1 text-heading">
        This page didn&rsquo;t load.
      </h1>
      <p className="max-w-measure text-body-lg text-ink-secondary">
        Try again, or reach us directly on {business.phoneDisplay}.
      </p>
      <button
        type="button"
        onClick={reset}
        className={buttonClass({ className: "self-start" })}
      >
        Try again
      </button>
      <LinkRows
        className="mt-4 max-w-4xl"
        rows={[
          { title: "Chat on WhatsApp", text: "Tell us what you were trying to do.", href: whatsappLink("Hi SHERO, a page on your site didn't load: "), external: true },
          { title: "Home", text: "Start from the beginning.", href: routes.home },
        ]}
      />
    </section>
  );
}
