import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge, listingStatusBadge } from "@/components/admin/Badge";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { listingStatuses, type ListingStatus } from "@/lib/admin/listing-form";
import { adminListings, listingCounts } from "@/lib/admin/listings";
import { checkSummary } from "@/lib/listings";
import { formatCedis } from "@/lib/orders";
import { getShopSettings } from "@/lib/shop";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Listings" };

/** The first photo, or an empty square until one is added. */
function Thumb({ src }: { src?: string }) {
  const box = "hidden size-10 shrink-0 rounded-sm border border-border bg-surface sm:block";
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" className={cn(box, "object-cover")} /> : <span aria-hidden="true" className={box} />;
}

const checkTone = { done: "done", todo: "todo", problem: "problem", none: "none" } as const;

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const requested = (await searchParams).status;
  const status = listingStatuses.some((s) => s.value === requested) ? (requested as ListingStatus) : null;
  const [rows, counts, settings] = await Promise.all([adminListings(status), listingCounts(), getShopSettings()]);

  const tabs = [{ value: null, label: "All", n: counts.all }, ...listingStatuses.map((s) => ({ ...s, n: counts[s.value] }))];

  return (
    <>
      <AdminHeader title="Listings" meta={counts.all === 1 ? "1 device" : `${counts.all} devices`}>
        <Link href="/admin/listings/new" className={buttonClass()}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.5} />
          New listing
        </Link>
      </AdminHeader>

      <div className="px-gutter py-6">
        <nav aria-label="Filter by status" className="flex gap-6 overflow-x-auto border-b border-border">
          {tabs.map((tab) => {
            const current = tab.value === status;
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/admin/listings?status=${tab.value}` : "/admin/listings"}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-baseline gap-1.5 border-b-2 pb-2.5 text-body-sm whitespace-nowrap",
                  current ? "border-primary font-medium text-heading" : "border-transparent text-ink-secondary hover:text-ink",
                )}
              >
                {tab.label}
                <span className="font-mono text-meta text-ink-muted">{tab.n}</span>
              </Link>
            );
          })}
        </nav>

        {rows.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-12">
            <p className="text-body text-ink-secondary">
              {status ? "No listings with this status." : "No listings yet. Add the first device and its check."}
            </p>
            {!status && (
              <Link href="/admin/listings/new" className={buttonClass()}>
                New listing
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-md border border-border">
            <table className="w-full text-left">
              <thead className="bg-surface font-mono text-meta text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-normal">device</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal lg:table-cell">serial</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">category</th>
                  <th scope="col" className="px-4 py-3 font-normal">price</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">battery</th>
                  <th scope="col" className="px-4 py-3 font-normal">status</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal sm:table-cell">device check</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ listing, check }) => {
                  const badge = listingStatusBadge[listing.status];
                  const summary = checkSummary(check, settings.minBatteryHealth);
                  return (
                    <tr key={listing.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <Link href={`/admin/listings/${listing.id}`} className="group flex items-center gap-3">
                          <Thumb src={listing.photos[0]} />
                          <span className="text-body-sm font-medium text-heading group-hover:underline">{listing.model}</span>
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-meta text-ink-secondary lg:table-cell">
                        {check?.serialLast4 ?? "–"}
                      </td>
                      <td className="hidden px-4 py-3 text-body-sm text-ink md:table-cell">{listing.category}</td>
                      <td className="px-4 py-3 font-mono text-body-sm whitespace-nowrap text-ink">
                        {formatCedis(listing.pricePesewas)}
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-meta text-secondary md:table-cell">
                        {check?.hasBattery === false ? (
                          <span className="text-ink-muted">no battery</span>
                        ) : check?.batteryHealth != null ? (
                          <span className={check.batteryHealth < settings.minBatteryHealth ? "text-danger" : undefined}>
                            {check.batteryHealth}%
                          </span>
                        ) : (
                          <span className="text-ink-muted">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge tone={checkTone[summary.tone]}>{summary.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
