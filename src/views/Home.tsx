"use client";
import LandingHero from "@/components/landing/LandingHero";
import LandingValueProps from "@/components/landing/LandingValueProps";
import LandingPartners from "@/components/landing/LandingPartners";
import LandingPillars from "@/components/landing/LandingPillars";
import LandingProducts from "@/components/landing/LandingProducts";
import LandingFinalCTA from "@/components/landing/LandingFinalCTA";

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
