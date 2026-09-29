import Link from "next/link";
import { ListingCard } from "@/components/shop/ListingCard";
import { DispatchCountdown } from "@/components/ui/LiveStatus";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { ShopListing } from "@/lib/shop";
import { routes, whatsappLink } from "@/lib/site";

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

export function InStock({ listings }: { listings: ShopListing[] }) {
  return (
    <Section divider aria-labelledby="stock-heading">
      <SectionHeader
        id="stock-heading"
        eyebrow="in stock"
        title="Laptops, ready for work."
        intro="UK-used and tested in Tamale, with the battery health on every listing."
        action={
          <Link href={routes.shop} className="text-label text-primary hover:underline">
            Full shop <InlineArrow />
          </Link>
        }
      />

      {listings.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-border pt-6 text-body text-ink-secondary">
          New stock is being checked. Every device is tested before it&rsquo;s listed, so laptops arrive in batches.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 lg:flex-row lg:items-center lg:justify-between">
        {/* The recommendation prompt replaces fixed "Good for" categories (PRD). */}
        <p className="text-body text-ink-secondary">
          Not sure which one?{" "}
          <a
            href={whatsappLink(recommendMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Tell us what it&rsquo;s for on WhatsApp
          </a>{" "}
          and we&rsquo;ll recommend one.
        </p>
        <DispatchCountdown
          fallback="Order before 5:00 PM for same-day dispatch to the bus station"
          className="font-mono text-meta text-ink-muted"
        />
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <h3 className="font-mono text-eyebrow text-secondary">every device, before it&rsquo;s listed</h3>
        <ol className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((check) => (
            <li key={check.title} className="flex flex-col gap-1 border-t border-border pt-4">
              <span className="text-body font-semibold text-ink">{check.title}</span>
              <span className="text-body-sm text-ink-secondary">{check.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
