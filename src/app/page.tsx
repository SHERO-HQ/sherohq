import { Building } from "@/components/home/Building";
import { Hero } from "@/components/home/Hero";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { WorkPreview } from "@/components/home/WorkPreview";
import { ClosingCta } from "@/components/site/ClosingCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <Building />
      <WorkPreview />
      <ClosingCta />
    </>
  );
}
