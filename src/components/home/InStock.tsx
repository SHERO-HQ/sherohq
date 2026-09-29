import Link from "next/link";
import { BatteryFull, ClipboardCheck, RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
    icon: ClipboardCheck,
    title: "Every part tested",
    detail: "Screen, keyboard, trackpad, ports, speakers, camera, Wi-Fi and charging.",
  },
  {
    icon: BatteryFull,
    title: "Battery at 90% or more",
    detail: "Usually replaced with an original battery at 100%. Each listing shows its figure.",
  },
  {
    icon: RotateCcw,
    title: "Cleaned and reset",
    detail: "Cleaned and reset to factory settings, ready to set up as your own.",
  },
  {
    icon: ShieldCheck,
    title: "One-week warranty",
    detail: "Covered for the first week after delivery, and support stays free after that.",
  },
];

const buying = [
  { icon: Truck, title: "Free delivery over GHS 2,000", detail: "Same day in Tamale, by bus elsewhere, or collect free." },
  { icon: Wallet, title: "Pay how you prefer", detail: "MoMo, card, cash on delivery, or when you collect." },
  { icon: ShieldCheck, title: "One-week warranty", detail: "We repair or replace anything we tested; support stays free." },
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

      {/* How buying works, next to the laptops it applies to. */}
      <ul aria-label="How buying from SHERO works" className="mt-8 grid gap-5 border-t border-border pt-6 md:grid-cols-3 md:gap-8">
        {buying.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex gap-3">
            <Icon aria-hidden="true" size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-secondary" />
            <span className="flex flex-col">
              <span className="text-body-sm font-semibold text-ink">{title}</span>
              <span className="text-body-sm text-ink-secondary">{detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 lg:flex-row lg:items-center lg:justify-between">
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
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {checks.map(({ icon: Icon, title, detail }) => (
            <li key={title}>
              <Card className="h-full gap-2 p-5">
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} className="text-secondary" />
                <span className="pt-1 text-body font-semibold text-ink">{title}</span>
                <span className="text-body-sm text-ink-secondary">{detail}</span>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
