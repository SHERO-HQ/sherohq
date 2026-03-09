"use client";
import LandingHero from "@/components/landing/LandingHero";
import LandingAbout from "@/components/landing/LandingAbout";
import LandingPillars from "@/components/landing/LandingPillars";
import LandingPathways from "@/components/landing/LandingPathways";
import LandingStats from "@/components/landing/LandingStats";
import LandingProducts from "@/components/landing/LandingProducts";
import LandingFinalCTA from "@/components/landing/LandingFinalCTA";

const Home = () => {
  return (
    <>
      <LandingHero />
      <LandingAbout />
      {/* <LandingPartners /> */}
      <LandingPillars />
      <LandingStats />
      <LandingProducts />
      <LandingPathways />
      <LandingFinalCTA />
    </>
  );
};

export default Home;
