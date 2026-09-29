import Link from "next/link";
import { routes } from "@/lib/site";

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
            <th className="w-[114px] py-3 pl-6 font-normal">grade</th>
            <th className="w-[174px] py-3 pl-6 font-normal">price</th>
            <th className="w-[114px] py-3 pl-6">
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

      <div className="flex items-center justify-between lg:pt-[18px]">
        <p className="hidden font-mono text-xs/4 text-ink-muted lg:block">
          uk-used · grade a++ · tested and cleaned · one-week warranty
        </p>
        <Link
          href={routes.shop}
          className="whitespace-nowrap text-[15px]/[22px] font-medium text-primary hover:underline lg:text-sm/5"
        >
          Full shop →
        </Link>
      </div>
    </section>
  );
}
