"use client";
import React from "react";
import { m } from "motion/react";

interface PartnerGridProps {
  prefersReducedMotion: boolean;
}

const PARTNERS = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  { name: "Lenovo", logo: "/assets/images/partners/lenovo.svg", logoClassName: "h-5 sm:h-7" },
  { name: "JBL", logo: "/assets/images/partners/jbl.svg" },
  { name: "Apple", logo: "/assets/images/partners/apple.svg", logoDark: "/assets/images/partners/apple-dark.svg" },
  { name: "Samsung", logo: "/assets/images/partners/samsung.svg", logoDark: "/assets/images/partners/samsung-dark.svg", logoClassName: "h-5 sm:h-6" },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

export const PartnerGrid = ({ prefersReducedMotion }: PartnerGridProps) => {
  return (
    <m.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-0 right-0 w-full"
    >
      <div className="container max-w-7xl mx-auto px-4">
        <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 sm:mb-4 font-mono">
          Hardware & OEM Brands We Supply & Support
        </p>
        <ul className="grid grid-cols-4 md:flex md:flex-wrap justify-center items-center gap-x-6 gap-y-4 sm:gap-x-12 w-full opacity-90 transition-opacity duration-300">
          {PARTNERS.map((partner) => (
            <li
              key={partner.name}
              className="flex justify-center items-center transition-transform duration-300 hover:scale-105"
              title={partner.name}
            >
              <img
                src={`${partner.logo}?v=2`}
                alt={`${partner.name} logo`}
                width={120}
                height={40}
                className={`w-auto max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-[opacity,filter] duration-300 ${
                  partner.logoClassName ?? "h-7 sm:h-9"
                } ${partner.logoDark ? "dark:hidden block" : ""}`}
                loading="eager"
                decoding="sync"
              />
              {partner.logoDark && (
                <img
                  src={`${partner.logoDark}?v=2`}
                  alt={`${partner.name} logo`}
                  width={120}
                  height={40}
                  className={`w-auto max-w-full object-contain filter grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-[opacity,filter] duration-300 ${
                    partner.logoClassName ?? "h-7 sm:h-9"
                  } hidden dark:block`}
                  loading="eager"
                  decoding="sync"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </m.div>
  );
};
