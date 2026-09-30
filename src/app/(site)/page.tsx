import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Hero } from "@/components/home/Hero";
import { InStock } from "@/components/home/InStock";
import { OwnProducts } from "@/components/home/OwnProducts";
import { ClientStrip } from "@/components/home/ClientStrip";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { getNewestInStock, shopSettingsForCopy } from "@/lib/shop";
import { getPublishedProducts } from "@/lib/products";
import { getPublicTestimonials } from "@/lib/testimonials";

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
      {/* Desktops: hero and clients fill the first screen, clients at its bottom edge (Clerk). */}
      <div className="lg:flex lg:min-h-first-screen lg:flex-col">
        <Hero />
        <ClientStrip />
      </div>
      <ServicesOverview />
      <InStock listings={await newestStock()} thresholdPesewas={(await shopSettingsForCopy()).freeDeliveryThresholdPesewas} />
      <OwnProducts products={await getPublishedProducts()} />
      <Testimonials items={await getPublicTestimonials()} />
      <ConsultationCta />
    </>
  );
}
