import Link from "next/link";
import { DispatchCountdown } from "@/components/ui/LiveStatus";
import { routes, whatsappLink } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

export type StockRow = {
  id: string;
  model: string;
  spec: string;
  grade: string;
  batteryHealth: string;
  price: string;
  href: string;
};

// TODO(shop phase): replace with the four newest In stock laptops from the
// listings table. Until then the rows mirror the design's placeholders.
const placeholderRows: StockRow[] = Array.from({ length: 4 }, (_, i) => ({
  id: `placeholder-${i}`,
  model: "[Laptop model]",
  spec: "[processor · ram · storage]",
  grade: "A++",
  batteryHealth: "[100]",
  price: "GHS [price]",
  href: routes.shop,
}));

const categories = ["Laptops", "Phones", "Desktops", "Audio", "Accessories"];

// What every listed device has been through. Matches the admin's device check
// (docs/admin-scope.md, Listings) and the shop rules in CLAUDE.md.
const checks = [
  {
    title: "Every part tested",
    detail: "Screen, keyboard, trackpad, ports, speakers, camera, Wi-Fi and charging.",
  },
  {
    title: "Battery at 90% or more",
    detail: "Usually replaced with an original battery at 100%. Each listing shows its figure.",
  },
  {
    title: "Cleaned and reset",
    detail: "Cleaned and reset to factory settings, ready to set up as your own.",
  },
  {
    title: "One-week warranty",
    detail: "Covered for the first week after delivery, and support stays free after that.",
  },
];

const recommendMessage = "Hi SHERO, I'm looking for a laptop. I'll mainly use it for: ";

export function InStock({ rows = placeholderRows }: { rows?: StockRow[] }) {
  return (
    <section className="container-site flex flex-col gap-4 pt-16 lg:gap-0 lg:pt-[104px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-6">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs/4 font-medium text-accent">in stock</p>
          <h2 className="font-display text-[30px]/[33px] font-bold tracking-[-0.02em] text-heading lg:text-5xl/[52px] lg:tracking-[-0.025em]">
            Laptops, ready for work.
          </h2>
        </div>
        <nav aria-label="Shop categories" className="hidden gap-7 lg:flex">
          {categories.map((category, i) => (
            <Link
              key={category}
              href={`${routes.shop}?category=${category.toLowerCase()}`}
              aria-current={i === 0 ? "true" : undefined}
              className={
                "pb-1.5 text-sm/5 font-medium " +
                (i === 0 ? "border-b-2 border-accent text-ink" : "text-ink-muted hover:text-ink")
              }
            >
              {category}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop: a spec table. Mobile: compact rows. */}
      <table className="hidden w-full border-collapse text-left lg:table">
        <thead>
          <tr className="border-b border-rule-strong font-mono text-xs/4 text-ink-muted">
            <th className="w-16 py-3 font-normal">
              <span className="sr-only">Photo</span>
            </th>
            <th className="py-3 pl-6 font-normal">model</th>
            <th className="py-3 pl-6 font-normal">spec</th>
            <th className="w-[90px] py-3 pl-6 font-normal">grade</th>
            <th className="w-[110px] py-3 pl-6 font-normal">battery</th>
            <th className="w-[174px] py-3 pl-6 font-normal">price</th>
            <th className="w-[90px] py-3 pl-6">
              <span className="sr-only">Link</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border">
              <td className="py-3.5">
                <div className="h-12 w-16 rounded-sm bg-surface" />
              </td>
              <td className="py-3.5 pl-6 text-base/6 font-medium text-ink">{row.model}</td>
              <td className="py-3.5 pl-6 font-mono text-[13px]/[17px] text-ink-secondary">{row.spec}</td>
              <td className="py-3.5 pl-6 font-mono text-[13px]/[17px] font-medium text-accent">{row.grade}</td>
              <td className="py-3.5 pl-6 font-mono text-[13px]/[17px] text-ink-secondary">{row.batteryHealth}%</td>
              <td className="py-3.5 pl-6 font-mono text-price text-ink">{row.price}</td>
              <td className="py-3.5 pl-6 text-right">
                <Link href={row.href} className="text-sm/5 font-medium text-primary hover:underline">
                  View<span className="sr-only"> {row.model}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="border-t border-rule-strong lg:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              href={row.href}
              className="grid grid-cols-[72px_1fr_auto] items-center gap-3.5 border-b border-border py-3.5"
            >
              <div className="h-[54px] w-[72px] rounded-sm bg-surface" />
              <span className="flex flex-col gap-1">
                <span className="text-base/[22px] font-medium text-ink">{row.model}</span>
                <span className="font-mono text-[11px]/[15px] font-medium text-accent">
                  {row.grade.toLowerCase()} · battery {row.batteryHealth}%
                </span>
              </span>
              <span className="font-mono text-[15px]/5 font-medium text-ink">{row.price}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:pt-[18px]">
        <DispatchCountdown
          fallback="Order before 5:00 PM for same-day dispatch to the bus station"
          className="font-mono text-xs/4 text-ink-muted"
        />
        <Link
          href={routes.shop}
          className="self-start whitespace-nowrap text-[15px]/[22px] font-medium text-primary hover:underline lg:text-sm/5"
        >
          Full shop <InlineArrow />
        </Link>
      </div>

      {/* The recommendation prompt replaces fixed "Good for" categories (PRD). */}
      <p className="mt-6 text-base/[25px] text-ink-secondary lg:mt-8 lg:text-[17px]/[27px]">
        Not sure which one?{" "}
        <a
          href={whatsappLink(recommendMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-3 hover:text-primary-hover"
        >
          Tell us what it&rsquo;s for on WhatsApp
        </a>{" "}
        and we&rsquo;ll recommend one.
      </p>

      <div className="mt-10 flex flex-col gap-5 lg:mt-14 lg:gap-6">
        <h3 className="font-mono text-xs/4 font-medium text-accent">every device, before it&rsquo;s listed</h3>
        <ol className="grid border-t border-rule-strong sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((check, i) => (
            <li
              key={check.title}
              className="flex flex-col gap-2 border-b border-border py-5 sm:odd:pr-6 sm:even:border-l sm:even:pl-6 lg:border-b-0 lg:py-6 lg:not-first:border-l lg:not-first:pl-6 lg:odd:pr-6 lg:even:pr-6"
            >
              <span className="font-mono text-xs/4 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-h3 text-heading">{check.title}</span>
              <span className="text-body-sm text-ink-secondary">{check.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
