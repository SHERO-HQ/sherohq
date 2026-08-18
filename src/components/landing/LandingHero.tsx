import React from "react";
import { HeroBackground } from "./hero/HeroBackground";
import { HeroContent as HeroContentComponent } from "./hero/HeroContent";
import { PartnerGrid } from "./hero/PartnerGrid";

interface HeroContentDef {
  mainHeader: string;
  subHeader: string;
}

const HERO_CONTENT: HeroContentDef = {
  mainHeader:
    "Software, Hardware & Technology Solutions \nfor Modern Businesses",
  subHeader:
    "We build software, deliver reliable hardware, and provide the technology services businesses need to innovate, operate, and grow."
} as const;

const LandingHero: React.FC = () => {
  const [headlineLead = "", headlineAccent = ""] = HERO_CONTENT.mainHeader
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <header
      className="relative min-h-[85dvh] lg:min-h-[83dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center pt-24 sm:pt-0 pb-48 md:pb-44 lg:pb-16"
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
        <HeroContentComponent 
          headlineLead={headlineLead}
          headlineAccent={headlineAccent}
          subHeader={HERO_CONTENT.subHeader}
        />
      </div>

      <PartnerGrid />
    </header>
  );
};

export default LandingHero;
