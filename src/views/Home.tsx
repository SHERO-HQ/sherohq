"use client";
import LandingHero from "@/components/landing/LandingHero";
import dynamic from "next/dynamic";

const LandingValueProps = dynamic(
  () => import("@/components/landing/LandingValueProps"),
);
const LandingPartners = dynamic(
  () => import("@/components/landing/LandingPartners"),
);
const LandingPillars = dynamic(
  () => import("@/components/landing/LandingPillars"),
);
const LandingProducts = dynamic(
  () => import("@/components/landing/LandingProducts"),
);
const LandingFinalCTA = dynamic(
  () => import("@/components/landing/LandingFinalCTA"),
);

const Home = () => {
  return (
    <>
      <LandingHero />
      <LandingValueProps />
      <LandingPartners />
      <LandingPillars />
      <LandingProducts />
      <LandingFinalCTA />
    </>
  );
};

export default Home;
