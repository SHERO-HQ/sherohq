import ServicesGrid from "@/components/solutions/ServicesGrid";
import SolutionsHero from "@/components/solutions/SolutionHero";
import Process from "@/components/solutions/Process";
import FinalCTA from "@/components/landing/LandingFinalCTA";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";

const Solutions = () => {
  useTitle("Solutions");
  return (
    <>
      <SolutionsHero />
      <ServicesGrid />
      <Process />
      <FinalCTA />
      <Footer />
    </>
  );
};

export default Solutions;
