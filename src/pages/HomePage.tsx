import HeroHeader from "@/components/HeroHeader";
import WhoWeAre from "@/components/WhoWeAre";
import { useTitle } from "@/hooks/useTitle";
import Footer from "@/components/Footer";
import Pillars from "@/components/Pillars";
import ThreePathCTA from "@/components/MainCTA";
import Stats from "@/components/Stats";
import ProductShowcase from "@/components/ProductShowCase";
import FinalCTA from "@/components/FinalCTA";

const HomePage = () => {
  useTitle("Home");
  return (
    <>
      <HeroHeader />
      <WhoWeAre />
      <Pillars />
      <Stats />
      <ProductShowcase />
      <ThreePathCTA />
      <FinalCTA />
      <Footer />
    </>
  );
};

export default HomePage;
