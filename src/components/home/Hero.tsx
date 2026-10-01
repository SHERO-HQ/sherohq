import Link from "next/link";
import { Building2, Laptop } from "lucide-react";
import { HeroArt } from "@/components/illustrations/ServiceArt";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { routes, shopUrl } from "@/lib/site";

// sherohq.com is SHERO's business site; the shop is its own site (owner,
// 1 Oct 2026). The headline says what SHERO does for businesses; the fork
// sends anyone after a laptop to the shop in one click.
const paths = [
  {
    label: "For your business",
    title: "Software and IT support",
    detail: "Systems built around how you work, and IT that keeps running. For clients in Ghana and abroad.",
    action: "See our services",
    href: routes.services,
    Icon: Building2,
  },
  {
    label: "For you",
    title: "Tested laptops",
    detail: "Checked before they're listed, with the battery health on every one. Delivered across Ghana.",
    action: "Shop laptops",
    href: shopUrl.home,
    Icon: Laptop,
  },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden lg:flex lg:flex-1 lg:items-center">
      {/* A faint dot grid, fading downwards: texture without a picture. */}
      <div aria-hidden="true" className="bg-dots mask-fade-down absolute inset-x-0 top-0 -z-10 h-160" />

      <div className="container-site grid items-center gap-12 pt-section pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-12">
        <div className="flex flex-col items-start gap-6">
          {/* The motto appears only here, on About and in the footer; the logo's bars only here, on About and the 404. */}
          <p className="flex items-center gap-3 font-mono text-meta text-ink-secondary">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="slant h-3 w-8 bg-navy-700" />
              <span className="slant h-3 w-4 bg-emerald-700" />
            </span>
            Redefine Possible.
          </p>
          <h1 className="max-w-2xl font-display text-h1 text-heading">Software and IT support for businesses, from Tamale.</h1>
          <ul className="grid w-full gap-3 sm:grid-cols-2">
            {paths.map(({ label, title, detail, action, href, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col gap-2 rounded-md border border-border bg-surface-raised p-5 shadow-xs transition-all duration-150 hover:border-primary hover:shadow active-press"
                >
                  <span className="flex items-center gap-2 font-mono text-meta text-secondary">
                    <Icon aria-hidden="true" size={16} strokeWidth={1.5} />
                    {label}
                  </span>
                  <span className="font-display text-h3 text-heading">{title}</span>
                  <span className="text-body-sm text-ink-secondary">{detail}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-label text-primary">
                    {action} <InlineArrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <HeroArt className="mx-auto hidden h-auto w-full max-w-md lg:block lg:max-w-lg" />
      </div>
    </section>
  );
}
