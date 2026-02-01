import LandingHero from "@/components/landing/LandingHero";
import LandingAbout from "@/components/landing/LandingAbout";
import Footer from "@/components/layout/Footer";
import LandingPillars from "@/components/landing/LandingPillars";
import LandingPathways from "@/components/landing/LandingPathways";
import LandingStats from "@/components/landing/LandingStats";
import LandingProducts from "@/components/landing/LandingProducts";
import LandingFinalCTA from "@/components/landing/LandingFinalCTA";
import Seo from "@/components/common/Seo";

const Home = () => {
  return (
    <>
      <Seo
        title="Home"
        description="SHERO - Innovative technology solutions that scale to elevate people, businesses, and communities."
      />
      <LandingHero />
      <LandingAbout />
      {/* <LandingPartners /> */}
      <LandingPillars />
      <LandingStats />
      <LandingProducts />
      <LandingPathways />
      <LandingFinalCTA />
      <Footer />
    </>
  );
};

export default Home;
