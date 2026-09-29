import type { Metadata } from "next";
import { Analytics } from "@/components/analytics/Analytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LinkRows } from "@/components/ui/LinkRows";
import { routes } from "@/lib/site";

export const metadata: Metadata = { title: "Page not found" };

const destinations = [
  { title: "Shop laptops", text: "UK-used, tested, delivered nationwide.", href: routes.shop },
  { title: "Services", text: "Software, hardware and IT support.", href: routes.services },
  { title: "Book a free consultation", text: "Tell us what you need.", href: routes.consultation },
  { title: "Home", text: "Start from the beginning.", href: routes.home },
];

// Unmatched URLs render outside the (site) route group, so the chrome is added here.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-site relative flex flex-col gap-5 pt-12 pb-16 lg:gap-7 lg:py-[120px]">
        {/* The logo's slanted bars: only the home hero, About hero and this page use them. */}
        <div aria-hidden="true" className="absolute top-[120px] right-20 hidden flex-col items-end gap-4 lg:flex">
          <span className="slant h-[84px] w-[280px] -translate-x-[120px] bg-navy-700" />
          <span className="slant h-[84px] w-[280px] bg-emerald-700" />
        </div>
        <p className="font-mono text-[13px]/[17px] font-medium text-accent lg:text-sm/[18px]">error 404</p>
        <h1 className="relative max-w-[760px] font-display text-[38px]/[39px] font-bold tracking-[-0.03em] text-heading lg:text-[72px]/[74px] lg:tracking-[-0.035em]">
          We couldn&rsquo;t find that page.
        </h1>
        <p className="relative max-w-[560px] text-[17px]/[26px] text-ink-secondary lg:text-xl/[31px]">
          It may have moved, or the link may be wrong.
          <span className="hidden lg:inline"> Here are the places most people are looking for.</span>
        </p>
        <div aria-hidden="true" className="flex gap-2.5 lg:hidden">
          <span className="slant h-[26px] w-[90px] bg-navy-700" />
          <span className="slant h-[26px] w-[54px] bg-emerald-700" />
        </div>
        <LinkRows rows={destinations} className="relative mt-4 max-w-[860px] lg:mt-6" />
      </main>
      <SiteFooter />
      <Analytics />
    </>
  );
}
