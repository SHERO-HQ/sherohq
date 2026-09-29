import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/shop/ListingCard";
import { GradeExplainer } from "@/components/shop/GradeExplainer";
import { ShopFilters, SortSelect } from "@/components/shop/ShopFilters";
import { DispatchCountdown } from "@/components/ui/LiveStatus";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { formatCedis } from "@/lib/orders";
import { getShopListings, getShopSettings, parseShopFilters, SHOP_PAGE_SIZE } from "@/lib/shop";
import { routes, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop UK-used laptops in Tamale",
  description:
    "Grade A++ UK-used laptops, each tested with its battery health listed. One-week warranty, same-day delivery in Tamale and by bus across Ghana.",
  alternates: { canonical: routes.shop },
};

const recommendMessage = "Hi SHERO, I'm looking for a laptop. I'll mainly use it for: ";

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseShopFilters(await searchParams);
  const [{ listings, matching, inStock }, settings] = await Promise.all([getShopListings(filters), getShopSettings()]);

  const categoryLabel =
    filters.categories.length === 1
      ? filters.categories[0]
      : filters.categories.length > 1
        ? `${filters.categories.length} categories`
        : "all devices";
  const filtered = filters.categories.length > 0 || filters.newBattery || filters.price !== null;

  const promises = [
    "Grade A++ UK-used",
    "Battery health on every listing",
    "One-week warranty and free support",
    `Free nationwide delivery over ${formatCedis(settings.freeDeliveryThresholdPesewas)}`,
  ];

  // "Show more" keeps the current filters and adds a page.
  const moreParams = new URLSearchParams();
  filters.categories.forEach((c) => moreParams.append("category", c));
  if (filters.newBattery) moreParams.set("battery", "new");
  if (filters.price) moreParams.set("price", filters.price);
  if (filters.sort !== "newest") moreParams.set("sort", filters.sort);
  moreParams.set("show", String(filters.show + SHOP_PAGE_SIZE));

  return (
    <>
      <section className="container-site flex flex-col gap-4 pt-10 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pt-[72px] lg:pb-10">
        <h1 className="max-w-[900px] font-display text-[38px]/[40px] font-bold tracking-[-0.03em] text-heading lg:text-[60px]/[62px] lg:tracking-[-0.035em]">
          UK-used laptops, tested and ready for work.
        </h1>
        <p className="shrink-0 font-mono text-[13px]/[17px] text-ink-secondary">
          {inStock === 1 ? "1 device" : `${inStock} devices`} in stock
        </p>
      </section>

      <section aria-label="What every device comes with" className="border-y border-border lg:border-t-rule-strong">
        <ul className="container-site flex flex-wrap gap-x-10 gap-y-1 py-3.5 font-mono text-xs/5 text-ink lg:py-[18px] lg:font-sans lg:text-sm/5 lg:font-medium">
          {promises.map((promise, i) => (
            <li key={promise} className={i > 2 ? "hidden sm:block" : undefined}>
              {promise}
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site pt-6 lg:pt-8">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6 lg:py-5">
          <p className="text-base/6 font-medium text-ink lg:text-[17px]/[26px]">
            Buying for school, work or design? Tell us what it&rsquo;s for and we&rsquo;ll recommend one.
          </p>
          <a
            href={whatsappLink(recommendMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[15px]/5 font-medium whitespace-nowrap text-primary hover:underline"
          >
            Ask on WhatsApp <InlineArrow />
          </a>
        </div>
      </section>

      <section aria-label="Devices" className="container-site grid gap-6 pt-6 pb-16 lg:grid-cols-[240px_1fr] lg:gap-14 lg:pt-10 lg:pb-24">
        <ShopFilters
          categories={settings.categories}
          minBattery={settings.minBatteryHealth}
          current={{
            categories: filters.categories,
            newBattery: filters.newBattery,
            price: filters.price,
            sort: filters.sort,
          }}
        />

        <div>
          <div className="flex items-center justify-between gap-4 pb-5">
            <p aria-live="polite" className="font-mono text-[13px]/[17px] text-ink-secondary">
              showing {categoryLabel} · {listings.length} of {matching}
            </p>
            <SortSelect value={filters.sort} />
          </div>

          {listings.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-10">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 border-t border-border pt-8">
              <h2 className="font-display text-h3 text-heading">
                {filtered ? "Nothing matches these filters right now." : "New stock is being checked."}
              </h2>
              <p className="max-w-[560px] text-ink-secondary">
                Every device is tested before it&rsquo;s listed, so stock comes in batches.{" "}
                <a
                  href={whatsappLink("Hi SHERO, I'm looking for: ")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-3"
                >
                  Tell us what you need on WhatsApp
                </a>{" "}
                and we&rsquo;ll tell you what&rsquo;s coming.
              </p>
              {filtered && (
                <Link href={routes.shop} className="font-medium text-primary underline underline-offset-3">
                  Clear filters
                </Link>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-10 lg:pt-12">
            {listings.length < matching && (
              <Link
                href={`${routes.shop}?${moreParams}`}
                scroll={false}
                className="inline-flex h-12 items-center rounded-sm border border-border-strong px-6 text-[15px]/5 font-medium text-ink hover:border-ink"
              >
                Show more
              </Link>
            )}
            <DispatchCountdown
              fallback="Order before 5:00 PM for same-day dispatch to the bus station"
              className="font-mono text-xs/4 text-ink-muted"
            />
          </div>
        </div>
      </section>

      <GradeExplainer minBattery={settings.minBatteryHealth} thresholdPesewas={settings.freeDeliveryThresholdPesewas} />
    </>
  );
}
