import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { buttonClass } from "@/components/ui/Button";
import { Gallery } from "@/components/shop/Gallery";
import { ListingCard } from "@/components/shop/ListingCard";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Readout, type ReadoutRow } from "@/components/ui/Readout";
import type { ListingSpecs } from "@/db/schema";
import { formatGhanaDate } from "@/lib/dates";
import { specSummary, type DeviceCheck } from "@/lib/listings";
import { formatCedis } from "@/lib/orders";
import { getListing, getShopSettings, getSimilarListings } from "@/lib/shop";
import { routes, siteUrl, whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getListing((await params).slug);
  if (!found) return {};
  const { listing, check } = found;
  const battery = check?.batteryHealth != null ? `, battery ${check.batteryHealth}%` : "";
  return {
    title: `${listing.model}, ${formatCedis(listing.pricePesewas)}`,
    description: `Grade A++ UK-used ${listing.model}: ${specSummary(listing.specs)}${battery}. Tested in Tamale, one-week warranty, delivered across Ghana.`,
    alternates: { canonical: `${routes.shop}/${listing.slug}` },
  };
}

const specRows: Array<{ key: keyof ListingSpecs; label: string }> = [
  { key: "processor", label: "processor" },
  { key: "ram", label: "memory" },
  { key: "storage", label: "storage" },
  { key: "screen", label: "screen" },
  { key: "graphics", label: "graphics" },
  { key: "system", label: "system" },
  { key: "other", label: "also" },
];

function batteryNote(check: DeviceCheck | null) {
  if (check?.batteryReplaced && check.batteryType?.toLowerCase() === "original")
    return "Battery replaced with an original battery. Measured when we tested this device.";
  if (check?.batteryReplaced) return "Battery replaced. Measured when we tested this device.";
  return "Measured when we tested this device.";
}

const result = (value: boolean | null | undefined) =>
  value === true ? "pass" : value === false ? "fail" : "not tested";

function checkRows(check: DeviceCheck | null): ReadoutRow[] {
  if (!check) return [];
  const group = (...values: Array<boolean | null>) =>
    values.every((v) => v === true) ? "pass" : values.map(result).join(" · ");
  const tone = (text: string) => (text === "pass" || text === "done" ? "done" : "pending") as ReadoutRow["tone"];
  const rows: Array<[string, string]> = [
    ["screen · keyboard · trackpad", group(check.screen, check.keyboard, check.trackpad)],
    ["ports · speakers · camera", group(check.ports, check.speakers, check.camera)],
    ["wi-fi · charging", group(check.wifi, check.charging)],
    ["battery health", check.batteryHealth != null ? `${check.batteryHealth}%` : "not recorded"],
    ["cosmetic condition", check.cosmeticCondition != null ? `${check.cosmeticCondition}%` : "not recorded"],
    ["cleaned and reset", check.cleanedAndReset ? "done" : "not yet"],
  ];
  return rows.map(([label, value]) => ({
    label,
    value,
    tone: label === "battery health" || label === "cosmetic condition" ? (value.endsWith("%") ? "done" : "pending") : tone(value),
  }));
}

const checkedOn = (date: Date | null | undefined) =>
  date ? `checked ${formatGhanaDate(date).toLowerCase()}` : "this device";

export default async function ListingPage({ params }: Props) {
  const found = await getListing((await params).slug);
  if (!found) notFound();
  const { listing, check } = found;
  const [settings, similar] = await Promise.all([getShopSettings(), getSimilarListings(listing)]);

  const available = listing.status === "in_stock";
  const isLaptop = listing.category.toLowerCase() === "laptops";
  const url = `${siteUrl}${routes.shop}/${listing.slug}`;
  const freeDelivery = listing.pricePesewas >= settings.freeDeliveryThresholdPesewas;
  const threshold = formatCedis(settings.freeDeliveryThresholdPesewas);
  const specs = specRows.filter((row) => listing.specs[row.key]);

  const facts = [
    { label: "warranty", text: "One week. We repair or replace anything we tested." },
    {
      label: "delivery",
      text: `Same day in Tamale. 12–72 hours elsewhere, by bus. ${
        freeDelivery ? "Free on this order." : `Free over ${threshold}; below that, the fee for your region shows at checkout.`
      } Or collect free from our store.`,
    },
    { label: "payment", text: "MoMo, card, cash on delivery, or pay when you collect." },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.model,
    description: listing.note ?? specSummary(listing.specs),
    category: listing.category,
    image: listing.photos.length > 0 ? listing.photos : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "GHS",
      price: (listing.pricePesewas / 100).toFixed(2),
      availability: available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": `${siteUrl}/#business` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="container-site pt-5 font-mono text-meta text-ink-muted lg:pt-6">
        <ol className="flex flex-wrap gap-2.5">
          <li>
            <Link href={routes.shop} className="text-ink-secondary underline underline-offset-3 hover:text-primary">
              shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`${routes.shop}?category=${listing.category.toLowerCase()}`}
              className="text-ink-secondary underline underline-offset-3 hover:text-primary"
            >
              {listing.category.toLowerCase()}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{listing.model.toLowerCase()}</li>
        </ol>
      </nav>

      <section className="container-site grid gap-7 pt-5 lg:grid-cols-[1.15fr_1fr] lg:gap-18 lg:pt-8 pb-section">
        <Gallery photos={listing.photos} model={listing.model} />

        <div className="flex flex-col gap-5 lg:gap-5.5">
          <p className={available ? "font-mono text-meta font-medium text-secondary" : "font-mono  font-medium text-warning"}>
            {available ? `uk-used · grade ${listing.grade.toLowerCase()}` : "reserved · another order is in progress"}
          </p>
          <h1 className="font-display text-h1 text-heading">
            {listing.model}
          </h1>
          {listing.note && <p className="text-body lg:text-body-lg text-ink-secondary">{listing.note}</p>}
          <p className="font-mono text-h2 font-medium text-ink">{formatCedis(listing.pricePesewas)}</p>

          {check?.batteryHealth != null && (
            <div className="flex flex-col gap-2.5 rounded-md border border-border bg-surface p-4.5">
              <div className="flex items-baseline justify-between">
                <span className="text-body font-medium text-ink">Battery health</span>
                <span className="font-mono text-h2 font-medium text-secondary">{check.batteryHealth}%</span>
              </div>
              <div
                role="meter"
                aria-label="Battery health"
                aria-valuenow={check.batteryHealth}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 rounded-sm bg-border"
              >
                <div className="h-2 rounded-sm bg-secondary" style={{ width: `${check.batteryHealth}%` }} />
              </div>
              <p className="text-body-sm text-ink-secondary">{batteryNote(check)}</p>
            </div>
          )}

          {specs.length > 0 && (
            <dl>
              {specs.map((row) => (
                <div key={row.key} className="grid grid-cols-[96px_1fr] gap-4 border-t border-border py-3 lg:grid-cols-[120px_1fr]">
                  <dt className="pt-0.5 font-mono text-meta text-ink-muted">{row.label}</dt>
                  <dd className="text-body text-ink">{listing.specs[row.key]}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap gap-3">
            {/* Phones use the sticky bar below instead. */}
            <span className="hidden sm:contents">
              <AddToCart listingId={listing.id} available={available} />
            </span>
            <a
              href={whatsappLink(`Hi SHERO, I'm asking about the ${listing.model}: ${url}`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({ variant: "secondary", size: "lg" })}
            >
              Ask about it on WhatsApp
            </a>
          </div>

          <dl className="flex flex-col gap-2.5 border-t border-border pt-4.5">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline gap-3">
                <dt className="w-22.5 shrink-0 font-mono text-meta text-ink-muted">{fact.label}</dt>
                <dd className="text-body-sm text-ink">{fact.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {check && (
        <section aria-labelledby="check-heading" className="border-y border-border bg-surface py-section">
          <div className="container-site grid gap-8 lg:grid-cols-[1fr_460px] lg:gap-24">
            <div className="flex flex-col items-start gap-4 lg:gap-5">
              <h2
                id="check-heading"
                className="font-display text-h1 text-heading"
              >
                How we checked this {isLaptop ? "laptop" : "device"}.
              </h2>
              <p className="max-w-measure text-body lg:text-body-lg text-ink-secondary">
                Every device goes through the same check before it&rsquo;s listed. This is the result for this one.
              </p>
              <Link href={`${routes.shop}#grade`} className="text-body-sm font-medium whitespace-nowrap text-primary hover:underline">
                What Grade A++ means <InlineArrow />
              </Link>
            </div>
            <Readout
              title={check.serialLast4 ? `device check / serial ending ${check.serialLast4.toLowerCase()}` : "device check"}
              caption={checkedOn(check.checkedAt)}
              rows={checkRows(check)}
            />
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="container-site flex flex-col gap-6 lg:gap-8 py-section">
          <h2
            id="similar-heading"
            className="font-display text-h1 text-heading"
          >
            Similar {isLaptop ? "laptops" : listing.category.toLowerCase()}.
          </h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-7">
            {similar.map((item, i) => (
              <li key={item.id} className={i === 2 ? "hidden lg:block" : undefined}>
                <ListingCard listing={item} compact />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Phones: price and Add to cart stay in reach while scrolling. */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-page px-5 py-3 sm:hidden">
        <span className="flex flex-col">
          <span className="font-mono text-meta text-ink-muted">total</span>
          <span className="font-mono text-price font-medium text-ink">{formatCedis(listing.pricePesewas)}</span>
        </span>
        <AddToCart listingId={listing.id} available={available} />
      </div>
    </>
  );
}
