import { LinkRows } from "@/components/ui/LinkRows";
import { routes } from "@/lib/site";

const destinations = [
  { title: "Shop laptops", text: "UK-used, tested, delivered nationwide.", href: routes.shop },
  { title: "Services", text: "Software, hardware and IT support.", href: routes.services },
  { title: "Book a free consultation", text: "Tell us what you need.", href: routes.consultation },
  { title: "Home", text: "Start from the beginning.", href: routes.home },
];

export const notFoundClass = "container-site relative flex flex-col gap-5 lg:gap-7 py-section";

/** The 404 message and where to go instead, without the site header and footer. */
export function NotFoundContent() {
  return (
    <>
      {/* The logo's slanted bars: only the home hero, About hero and this page use them. */}
      <div aria-hidden="true" className="absolute top-30 right-20 hidden flex-col items-end gap-4 lg:flex">
        <span className="slant h-12 w-40 -translate-x-8 bg-navy-700" />
        <span className="slant h-12 w-40 bg-emerald-700" />
      </div>
      <p className="font-mono text-meta lg:text-body-sm font-medium text-secondary">error 404</p>
      <h1 className="relative max-w-measure font-display text-h1 text-heading">We couldn&rsquo;t find that page.</h1>
      <p className="relative max-w-measure text-body-lg text-ink-secondary">
        It may have moved, or the link may be wrong.
        <span className="hidden lg:inline"> Here are the places most people are looking for.</span>
      </p>
      <div aria-hidden="true" className="flex gap-2.5 lg:hidden">
        <span className="slant h-6.5 w-22.5 bg-navy-700" />
        <span className="slant h-6.5 w-13.5 bg-emerald-700" />
      </div>
      <LinkRows rows={destinations} className="relative mt-4 max-w-4xl lg:mt-6" />
    </>
  );
}
