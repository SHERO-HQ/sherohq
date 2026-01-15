import ServicesGrid from "@/components/ServicesGrid";
import SolutionsHero from "@/components/SolutionHero";
import Footer from "@/components/Footer";
import { useTitle } from "@/hooks/useTitle";

const Solutions = () => {
  useTitle("Solutions");
  return (
    <>
      <SolutionsHero />
      <ServicesGrid />
      <Footer />
    </>
  );
};

export default Solutions;
