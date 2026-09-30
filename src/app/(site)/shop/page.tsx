import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/shop/ListingCard";
import { GradeExplainer } from "@/components/shop/GradeExplainer";
import { ShopFilters, SortSelect } from "@/components/shop/ShopFilters";
import { DispatchCountdown } from "@/components/ui/LiveStatus";
import { buttonClass } from "@/components/ui/Button";
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
  const [{ listings, matching }, settings] = await Promise.all([getShopListings(filters), getShopSettings()]);

  const filtered = filters.categories.length > 0 || filters.newBattery || filters.price !== null;

  // "Show more" keeps the current filters and adds a page.
  const moreParams = new URLSearchParams();
  filters.categories.forEach((c) => moreParams.append("category", c));
  if (filters.newBattery) moreParams.set("battery", "new");
  if (filters.price) moreParams.set("price", filters.price);
  if (filters.sort !== "newest") moreParams.set("sort", filters.sort);
  moreParams.set("show", String(filters.show + SHOP_PAGE_SIZE));

  return (
    <>
      <section className="container-site pt-section">
        <h1 className="max-w-4xl font-display text-h1 text-heading">
          UK-used laptops, tested and ready for work.
        </h1>
      </section>

      <section className="container-site pt-6 lg:pt-8">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6 lg:py-5">
          <p className="text-body lg:text-body-lg font-medium text-ink">
            Buying for school, work or design? Tell us what it&rsquo;s for and we&rsquo;ll recommend one.
          </p>
          <a
            href={whatsappLink(recommendMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: "secondary", className: "self-start lg:self-auto" })}
          >
            Ask on WhatsApp
          </a>
        </div>
      </section>

      <section aria-label="Devices" className="container-site grid gap-6 pt-6 lg:grid-cols-[240px_1fr] lg:gap-14 lg:pt-10 pb-section">
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
            <p aria-live="polite" className="text-body-sm text-ink-secondary">
              {listings.length < matching ? `Showing ${listings.length} of ${matching}` : `${matching} ${matching === 1 ? "device" : "devices"}`}
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
              <p className="max-w-measure text-ink-secondary">
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
                className={buttonClass({ variant: "outline", size: "lg" })}
              >
                Show more
              </Link>
            )}
            <DispatchCountdown
              fallback="Order before 5:00 PM for same-day dispatch to the bus station"
              className="font-mono text-meta text-ink-muted"
            />
          </div>
        </div>
      </section>

      <GradeExplainer minBattery={settings.minBatteryHealth} thresholdPesewas={settings.freeDeliveryThresholdPesewas} />
    </>
  );
}
