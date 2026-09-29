import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Hero } from "@/components/home/Hero";
import { InStock, type StockRow } from "@/components/home/InStock";
import { OwnProducts } from "@/components/home/OwnProducts";
import { ProofStrip } from "@/components/home/ProofStrip";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { listingHref } from "@/components/shop/ListingCard";
import { specSummary } from "@/lib/listings";
import { formatCedis } from "@/lib/orders";
import { getNewestLaptops } from "@/lib/shop";

// Static and fast, refreshed every few minutes so new stock shows up.
export const revalidate = 300;

async function stockRows(): Promise<StockRow[]> {
  try {
    const laptops = await getNewestLaptops(4);
    return laptops.map((laptop) => ({
      id: laptop.id,
      model: laptop.model,
      spec: specSummary(laptop.specs),
      grade: laptop.grade,
      batteryHealth: String(laptop.batteryHealth ?? ""),
      price: formatCedis(laptop.pricePesewas),
      href: listingHref(laptop.slug),
      photo: laptop.photos[0],
    }));
  } catch (error) {
    // Without the database (e.g. a build with no DATABASE_URL), Home still renders.
    console.error("Loading stock for Home failed", error);
    return [];
  }
}

export default async function HomePage() {
  return (
    <>
      <BusinessJsonLd />
      <Hero />
      <ProofStrip />
      <ServicesOverview />
      <InStock rows={await stockRows()} />
      <OwnProducts />
      <ConsultationCta />
    </>
  );
}
