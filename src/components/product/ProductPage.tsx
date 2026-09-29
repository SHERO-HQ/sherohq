import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProductPageContent } from "@/content/products";
import { routes } from "@/lib/site";
import { WaitlistForm } from "./WaitlistForm";

/** One layout for every SHERO product; only content and colours change. */
export function ProductPage({ product }: { product: ProductPageContent }) {
  return (
    <div className={product.theme}>
      <section className="border-b border-border">
        <div className="container-site grid gap-8 py-8 lg:grid-cols-[1.25fr_1fr] lg:gap-[88px] lg:py-24">
          <div className="flex flex-col gap-4 lg:gap-[26px]">
            <div className="flex items-center gap-4">
              {/* TODO(owner): the product's logo file. */}
              <Placeholder
                label={`${product.name} logo`}
                className="h-10 border border-dashed border-border px-3.5 font-medium text-product-accent"
              />
              <StatusBadge status="dev" />
            </div>
            <h1 className="font-display text-[34px]/9 font-bold tracking-[-0.03em] text-heading lg:text-[64px]/[66px] lg:tracking-[-0.035em]">
              {product.title}
            </h1>
            <p className="max-w-[620px] text-base/[25px] text-ink-secondary lg:text-[19px]/[30px]">
              <span className="lg:hidden">{product.problemMobile}</span>
              <span className="hidden lg:inline">{product.problem}</span>
            </p>
            <div className="flex flex-col gap-1.5 border-t border-border pt-4">
              <span className="font-mono text-xs/4 font-medium text-product-accent">who it&rsquo;s for</span>
              <span className="text-base/6 font-medium text-ink lg:text-[17px]/[26px]">
                <span className="lg:hidden">{product.audienceMobile}</span>
                <span className="hidden lg:inline">{product.audience}</span>
              </span>
            </div>
          </div>
          <WaitlistForm product={product} />
        </div>
      </section>

      <section className="container-site grid gap-4 pt-12 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16 lg:pt-[104px]">
        {/* Unreleased: the preview always carries a visible tag (CLAUDE.md). */}
        <figure className="relative">
          <Placeholder
            label={product.previewLabel}
            className="h-[260px] border border-border bg-surface pt-8 lg:h-[520px] lg:pt-0"
          />
          <StatusBadge status="dev" label="Preview · in development" className="absolute top-4 left-4" />
        </figure>
        <p className="font-display text-[22px]/[29px] font-semibold text-heading lg:mb-2 lg:text-[30px]/[38px] lg:tracking-[-0.015em]">
          An early look at the {product.name} dashboard. It will change before launch.
        </p>
      </section>

      <section className="container-site flex flex-col gap-6 py-12 lg:gap-10 lg:py-[104px]">
        <h2 className="font-display text-[28px]/8 font-bold text-heading lg:text-[44px]/[48px] lg:tracking-[-0.025em]">
          <span className="lg:hidden">{product.compareTitleMobile}</span>
          <span className="hidden lg:inline">{product.compareTitle}</span>
        </h2>
        <table className="w-full border-collapse text-left">
          <thead className="hidden lg:table-header-group">
            <tr className="border-b border-rule-strong font-mono text-xs/4">
              <th className="w-1/2 pr-14 pb-3 font-normal text-ink-muted">today</th>
              <th className="pb-3 font-medium text-product-accent">with {product.name.toLowerCase()}</th>
            </tr>
          </thead>
          <tbody className="border-t border-rule-strong lg:border-t-0">
            {product.compare.map((row) => (
              <tr key={row.today} className="flex flex-col gap-1 border-b border-border py-4 lg:table-row lg:py-0">
                <td className="text-[15px]/[22px] text-ink-secondary lg:py-6 lg:pr-14 lg:text-[17px]/[26px]">
                  <span className="mr-2 font-mono text-[11px] text-ink-muted lg:hidden">today</span>
                  <span className="lg:hidden">{row.todayMobile ?? row.today}</span>
                  <span className="hidden lg:inline">{row.today}</span>
                </td>
                <td className="text-base/6 font-medium text-ink lg:py-6 lg:text-[17px]/[26px]">
                  <span className="mr-2 font-mono text-[11px] font-medium text-product-accent lg:hidden">with</span>
                  <span className="lg:hidden">{row.withMobile ?? row.with}</span>
                  <span className="hidden lg:inline">{row.with}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-site flex flex-col gap-3 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-12">
          <p className="max-w-[620px] text-base/[25px] text-ink-secondary lg:text-[17px]/[26px]">
            {product.name} is built by SHERO, alongside our software, hardware and IT services.
          </p>
          <Link href={routes.services} className="self-start text-sm/5 font-medium text-primary hover:underline lg:self-auto">
            More from SHERO <InlineArrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
