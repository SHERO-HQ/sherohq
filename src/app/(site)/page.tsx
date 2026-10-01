import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Hero } from "@/components/home/Hero";
import { OwnProducts } from "@/components/home/OwnProducts";
import { ClientStrip } from "@/components/home/ClientStrip";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { getPublishedProducts } from "@/lib/products";
import { getPublicTestimonials } from "@/lib/testimonials";

// Static and fast; refreshed when the admin saves products, projects or testimonials.
export const revalidate = 300;

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
      <OwnProducts products={await getPublishedProducts()} />
      <Testimonials items={await getPublicTestimonials()} />
      <ConsultationCta />
    </>
  );
}
