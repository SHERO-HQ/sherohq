import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Hero } from "@/components/home/Hero";
import { InStock } from "@/components/home/InStock";
import { OwnProducts } from "@/components/home/OwnProducts";
import { ProofStrip } from "@/components/home/ProofStrip";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";

export default function HomePage() {
  return (
    <>
      <BusinessJsonLd />
      <Hero />
      <ProofStrip />
      <ServicesOverview />
      <InStock />
      <OwnProducts />
      <ConsultationCta />
    </>
  );
}
