import LandingHero from "@/components/landing/LandingHero";
import dynamic from "next/dynamic";

const LandingAbout = dynamic(
  () => import("@/components/landing/LandingAbout"),
);
const LandingEcosystem = dynamic(
  () => import("@/components/landing/LandingEcosystem"),
);
const LandingProducts = dynamic(
  () => import("@/components/landing/LandingProducts"),
);
const ClientLogoBar = dynamic(
  () => import("@/components/landing/ClientLogoBar"),
);
const LandingTestimonials = dynamic(
  () => import("@/components/landing/LandingTestimonials"),
);
const LandingFinalCTA = dynamic(
  () => import("@/components/landing/LandingFinalCTA"),
);

import { SHOP_ENABLED } from "@/constants/features";

const HardwareServiceLine = dynamic(
  () => import("@/components/landing/HardwareServiceLine"),
);

const Home = () => {
  return (
    <>
      <LandingHero />
      <LandingAbout />
      <ClientLogoBar />
      <LandingEcosystem />
      {SHOP_ENABLED ? <LandingProducts /> : <HardwareServiceLine />}
      <LandingTestimonials limit={5} />
      <LandingFinalCTA />
    </>
  );
};

export default Home;
