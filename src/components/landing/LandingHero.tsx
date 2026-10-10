import React from "react";
import { HeroBackground } from "./hero/HeroBackground";
import { HeroContent as HeroContentComponent } from "./hero/HeroContent";

interface HeroContentDef {
  mainHeader: string;
  subHeader: string;
}

const HERO_CONTENT: HeroContentDef = {
  mainHeader:
    "Solutions for People,\nBusinesses and Communities",
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
      className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col py-24 sm:py-16"
      role="banner"
      aria-label="Hero section - Company mission statement"
    >
      <HeroBackground />

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
          <HeroContentComponent 
            headlineLead={headlineLead}
            headlineAccent={headlineAccent}
            subHeader={HERO_CONTENT.subHeader}
          />
        </div>
      </div>
    </header>
  );
};

export default LandingHero;
