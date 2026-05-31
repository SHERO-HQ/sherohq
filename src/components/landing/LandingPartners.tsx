import { Briefcase } from "lucide-react";

// Partner/brand logos - real brands SHERO works with
const PARTNERS = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  { name: "Lenovo", logo: "/assets/images/partners/lenovo.svg" },
  { name: "JBL", logo: "/assets/images/partners/jbl.svg" },
  {
    name: "Apple",
    logo: "/assets/images/partners/apple.svg",
    logoDark: "/assets/images/partners/apple-dark.svg",
  },
  {
    name: "Samsung",
    logo: "/assets/images/partners/samsung.svg",
    logoDark: "/assets/images/partners/samsung-dark.svg",
    scale: "scale-110",
  },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

const LandingPartners = () => {
  return (
    <section className="relative w-full overflow-hidden border-y border-slate-200 bg-white py-14 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950">
      
      {/* Self-contained, highly optimized, 100% hot-reload safe marquee animation */}
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 30s linear infinite;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
            transform: none !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-80 transition-opacity duration-300 dark:opacity-25" />

      {/* Header */}
      <div className="container relative z-10 mx-auto mb-10 px-4 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded border border-brand-secondary-500/50 bg-brand-secondary-100 px-4 py-1 text-[10px] font-semibold uppercase text-brand-secondary-600 transition-colors duration-300 dark:border-brand-secondary-800/50 dark:bg-brand-secondary-200/20 dark:text-brand-secondary-400">
          <Briefcase className="size-4" />
          Trusted Brands
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-300 md:text-3xl dark:text-slate-100">
          We Supply & Support the Best
        </h2>
      </div>

      {/* Infinite Logo Marquee */}
      <div className="relative w-full overflow-hidden py-6">
        {/* Gradient edge masks for flawless fading in/out */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-16 sm:w-36 bg-linear-to-r from-white to-transparent transition-colors duration-300 dark:from-slate-950" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-16 sm:w-36 bg-linear-to-l from-white to-transparent transition-colors duration-300 dark:from-slate-950" />

        {/* Scrolling container holding double tracks for endless loops */}
        <div className="flex w-full select-none marquee-wrapper">
          <div className="marquee-track flex shrink-0 gap-8 sm:gap-16 items-center pr-8 sm:pr-16">
            {/* Track 1: Original Logos */}
            {PARTNERS.map((partner, idx) => (
              <div
                key={`orig-${partner.name}-${idx}`}
                className="group flex h-12 w-32 sm:h-16 sm:w-32 items-center justify-center opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-300 select-none cursor-pointer"
                title={partner.name}
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className={`h-8 sm:h-10 w-auto object-contain transition-transform duration-300 ${partner.scale || ""} ${partner.logoDark ? "dark:hidden" : ""}`}
                  loading="eager"
                  decoding="async"
                />
                {partner.logoDark && (
                  <img
                    src={partner.logoDark}
                    alt={`${partner.name} logo dark`}
                    className={`h-8 sm:h-24 w-auto object-contain transition-transform duration-300 hidden dark:block ${partner.scale || ""}`}
                    loading="eager"
                    decoding="async"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Track 2: Duplicate Logos for seamless scrolling connection */}
          <div className="marquee-track flex shrink-0 gap-8 sm:gap-16 items-center pr-8 sm:pr-16" aria-hidden="true">
            {PARTNERS.map((partner, idx) => (
              <div
                key={`dup-${partner.name}-${idx}`}
                className="group flex h-12 w-32 sm:h-16 sm:w-32 items-center justify-center opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-300 select-none"
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className={`h-8 sm:h-24 w-auto object-contain transition-transform duration-300 ${partner.scale || ""} ${partner.logoDark ? "dark:hidden" : ""}`}
                  loading="eager"
                  decoding="async"
                />
                {partner.logoDark && (
                  <img
                    src={partner.logoDark}
                    alt={`${partner.name} logo dark`}
                    className={`h-8 sm:h-24 w-auto object-contain transition-transform duration-300 hidden dark:block ${partner.scale || ""}`}
                    loading="eager"
                    decoding="async"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPartners;
