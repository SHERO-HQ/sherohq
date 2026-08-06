"use client";
import LandingHero from "@/components/landing/LandingHero";
import dynamic from "next/dynamic";

const LandingValueProps = dynamic(
  () => import("@/components/landing/LandingValueProps"),
);
const LandingAbout = dynamic(
  () => import("@/components/landing/LandingAbout"),
);
const LandingPillars = dynamic(
  () => import("@/components/landing/LandingPillars"),
);
const LandingEcosystem = dynamic(
  () => import("@/components/landing/LandingEcosystem"),
);
const LandingSecurity = dynamic(
  () => import("@/components/landing/LandingSecurity"),
);
const LandingProducts = dynamic(
  () => import("@/components/landing/LandingProducts"),
);
const LandingFinalCTA = dynamic(
  () => import("@/components/landing/LandingFinalCTA"),
);
const LandingTestimonials = dynamic(
  () => import("@/components/landing/LandingTestimonials"),
);

const Home = () => {
  return (
    <>
      <LandingHero />
      <LandingValueProps />
      <LandingAbout />
      <LandingPillars />
      <LandingEcosystem />
      <LandingSecurity />
      <LandingProducts />
      <LandingTestimonials limit={5} />
      <LandingFinalCTA />
    </>
  );
};

export default Home;
