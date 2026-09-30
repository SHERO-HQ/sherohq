import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Hero } from "@/components/home/Hero";
import { InStock } from "@/components/home/InStock";
import { OwnProducts } from "@/components/home/OwnProducts";
import { ClientStrip } from "@/components/home/ClientStrip";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { getNewestInStock } from "@/lib/shop";

// Static and fast, refreshed every few minutes so new stock shows up.
export const revalidate = 300;

async function newestStock() {
  try {
    return await getNewestInStock(6);
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
      <ClientStrip />
      <ServicesOverview />
      <InStock listings={await newestStock()} />
      <OwnProducts />
      <ConsultationCta />
    </>
  );
}
