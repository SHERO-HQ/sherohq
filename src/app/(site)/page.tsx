import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Hero } from "@/components/home/Hero";
import { InStock } from "@/components/home/InStock";
import { OwnProducts } from "@/components/home/OwnProducts";
import { ProofStrip } from "@/components/home/ProofStrip";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { SupportBand } from "@/components/home/SupportBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <ServicesOverview />
      {/* The band sits after services on mobile and after products on desktop. */}
      <SupportBand className="lg:hidden" />
      <InStock />
      <OwnProducts />
      <SupportBand className="hidden lg:block" />
      <ConsultationCta />
    </>
  );
}
