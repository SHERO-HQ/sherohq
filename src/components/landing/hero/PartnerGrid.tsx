"use client";
import React from "react";
import { m } from "motion/react";

interface PartnerGridProps {
  prefersReducedMotion: boolean;
  heroReady: boolean;
}

const PARTNERS = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  { name: "Lenovo", logo: "/assets/images/partners/lenovo.svg", logoClassName: "h-5 sm:h-8" },
  { name: "JBL", logo: "/assets/images/partners/jbl.svg" },
  { name: "Apple", logo: "/assets/images/partners/apple.svg", logoDark: "/assets/images/partners/apple-dark.svg" },
  { name: "Samsung", logo: "/assets/images/partners/samsung.svg", logoDark: "/assets/images/partners/samsung-dark.svg", logoClassName: "h-5 sm:h-7" },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

export const PartnerGrid = ({ prefersReducedMotion, heroReady }: PartnerGridProps) => {
  return (
    <m.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? undefined : heroReady ? { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.5 } } : { opacity: 0, y: 10 }}
      className="absolute bottom-6 sm:bottom-15 left-0 right-0 w-full"
    >
      <div className="container max-w-7xl mx-auto px-4">
        <ul className="grid grid-cols-4 md:flex md:flex-wrap justify-center items-center gap-x-6 gap-y-6 sm:gap-x-12 w-full opacity-90 transition-opacity duration-500">
          {PARTNERS.map((partner) => (
            <li key={partner.name} className="flex justify-center items-center transition-transform duration-300 hover:scale-105" title={partner.name}>
              <img
                src={`${partner.logo}?v=2`}
                alt={`${partner.name} logo`}
                className={`w-auto max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${partner.logoClassName ?? "h-8 sm:h-10"} ${partner.logoDark ? "dark:hidden" : ""}`}
                loading="eager"
              />
              {partner.logoDark && (
                <img
                  src={`${partner.logoDark}?v=2`}
                  alt={`${partner.name} logo`}
                  className={`w-auto max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${partner.logoClassName ?? "h-8 sm:h-10"} hidden dark:block`}
                  loading="eager"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </m.div>
  );
};
