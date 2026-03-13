"use client";
import ServicesGrid from "@/components/solutions/ServicesGrid";
import SolutionsHero from "@/components/solutions/SolutionsHero";
import Process from "@/components/solutions/Process";
import FinalCTA from "@/components/landing/LandingFinalCTA";
import Portfolio from "@/components/solutions/Portfolio";

const Solutions = () => {
  return (
    <>
      <SolutionsHero />
      <ServicesGrid />
      <Process />
      <Portfolio />
      <FinalCTA />
    </>
  );
};

export default Solutions;
