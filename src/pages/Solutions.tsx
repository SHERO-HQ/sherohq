import ServicesGrid from "@/components/solutions/ServicesGrid";
import SolutionsHero from "@/components/solutions/SolutionHero";
import Process from "@/components/solutions/Process";
import FinalCTA from "@/components/landing/LandingFinalCTA";
import Portfolio from "@/components/solutions/Portfolio";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/common/Seo";

const Solutions = () => {
  return (
    <>
      <Seo
        title="Solutions"
        description="SHERO Technologies offers innovative software and IT solutions tailored for growth and efficiency."
        url="/solutions"
      />
      <SolutionsHero />
      <ServicesGrid />
      <Process />
      <Portfolio />
      <FinalCTA />
      <Footer />
    </>
  );
};

export default Solutions;
