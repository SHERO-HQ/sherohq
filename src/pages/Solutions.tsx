import ServicesGrid from "@/components/ServicesGrid";
import SolutionsHero from "@/components/SolutionHero";
import Process from "@/components/Process";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
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
