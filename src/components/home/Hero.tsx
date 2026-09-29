import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/lib/site";

const paths = [
  {
    title: "I need a laptop",
    description: "Strong enough for your work, with a battery you can trust.",
    tag: "shop laptops",
    href: routes.shop,
  },
  {
    title: "I need software built",
    description: "Your own system, built around how your business works.",
    tag: "custom software",
    href: `${routes.services}#software`,
  },
  {
    title: "I sell on social media",
    description: "Orders, payments and stock in one place.",
    tag: "merchander",
    href: `${routes.merchander}#waitlist`,
    waitlist: true,
  },
  {
    title: "I run a pharmacy",
    description: "Sales, stock and NHIS claims across your branches.",
    tag: "pharmasyst",
    href: `${routes.pharmasyst}#waitlist`,
    waitlist: true,
  },
];

export function Hero() {
  return (
    <section className="grid lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-5 px-5 pt-10 pb-7 lg:justify-between lg:gap-12 lg:pt-24 lg:pr-16 lg:pb-16 lg:pl-20">
        <div className="flex flex-col gap-5 lg:gap-8">
          {/* The motto appears only here, on About and in the footer. */}
          <h1 className="font-display text-[60px]/[56px] font-bold tracking-[-0.045em] text-heading lg:text-[120px]/[112px]">
            Redefine
            <br />
            Possible.
          </h1>
          <p className="max-w-[520px] text-[17px]/[26px] text-ink-secondary lg:text-xl/[31px]">
            SHERO builds software, supplies tested laptops and supports the technology businesses run on. From
            Tamale, Ghana.
          </p>
        </div>
        {/* The logo's slanted bars, in the fixed brand inks. */}
        <div aria-hidden="true" className="flex gap-2.5 lg:gap-3.5">
          <span className="slant h-[26px] w-[90px] bg-navy-700 lg:h-11 lg:w-[150px]" />
          <span className="slant h-[26px] w-[54px] bg-emerald-700 lg:h-11 lg:w-[90px]" />
        </div>
      </div>

      <div className="flex flex-col border-y border-border bg-surface px-5 pt-6 pb-8 lg:border-y-0 lg:border-l lg:pt-24 lg:pr-20 lg:pb-16 lg:pl-16">
        <p className="border-b border-rule-strong pb-3 font-mono text-xs/4 font-medium text-accent lg:pb-4">
          what do you need?
        </p>
        <ul>
          {paths.map((path) => (
            <li key={path.title}>
              <Link
                href={path.href}
                className="group grid grid-cols-[1fr_24px] items-center gap-3 border-b border-border py-[18px] lg:grid-cols-[1fr_40px] lg:gap-4 lg:py-[26px]"
              >
                <span className="flex flex-col gap-1.5 lg:gap-2">
                  <span className="flex flex-wrap items-center gap-2.5 lg:gap-3">
                    <span className="font-display text-[21px]/[26px] font-semibold text-heading lg:text-[30px]/9 lg:tracking-[-0.015em]">
                      {path.title}
                    </span>
                    {path.waitlist && <StatusBadge status="dev" label="waitlist" size="sm" />}
                  </span>
                  <span className="text-[15px]/[22px] text-ink-secondary lg:text-base/6">{path.description}</span>
                  <span className="hidden font-mono text-xs/4 font-medium text-accent lg:block">{path.tag}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="justify-self-end text-xl/6 font-medium text-primary transition-transform duration-150 group-hover:translate-x-1 lg:text-2xl/7"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={routes.consultation}
          className="mt-[18px] self-start text-[15px]/[22px] font-medium text-primary hover:underline hover:underline-offset-3 lg:mt-6 lg:text-sm/5"
        >
          Something else? Book a free consultation →
        </Link>
      </div>
    </section>
  );
}
