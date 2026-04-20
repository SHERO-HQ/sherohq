import Image from "next/image";
import { motion, scale } from "motion/react";
import { Briefcase } from "lucide-react";

// Partner/brand logos - real brands SHERO works with
const PARTNERS = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  { name: "Lenovo", logo: "/assets/images/partners/lenovo.svg" },
  { name: "JBL", logo: "/assets/images/partners/jbl.svg" },
  { name: "Apple", logo: "/assets/images/partners/apple.svg", logoDark: "/assets/images/partners/apple-dark.svg" },
  { name: "Samsung", logo: "/assets/images/partners/samsung.svg", logoDark: "/assets/images/partners/samsung-dark.svg", scale: "scale-125" },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

const LandingPartners = () => {
  // Duplicate for seamless loop
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="w-full py-12 bg-white dark:bg-slate-950 relative overflow-hidden border-y border-slate-200 dark:border-white/10 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 pattern-dots opacity-80 dark:opacity-25 transition-opacity duration-300" />

      {/* Header */}
      <div className="container mx-auto px-4 relative z-10 mb-8 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] uppercase font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded transition-colors duration-300">
          <Briefcase className="size-4" />
          Trusted Brands
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors duration-300">
          We Supply & Support the Best
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Scrolling Track */}
        <div className="flex overflow-hidden group">
          <motion.div
            className="flex gap-5 py-4"
            animate={{
              x: [0, -192 * PARTNERS.length], // Adjust based on item width + gap
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            whileHover={{ transition: { duration: 60 } }} // Slow down on hover for "pause" effect
          >
            {duplicatedPartners.map((partner, idx) => (
              <div
                key={`${partner.name}-${idx}`}
                title={partner.name}
                className="shrink-0 flex items-center justify-center mx-4
 transition duration-500
 cursor-pointer group/card grayscale hover:grayscale-0"
              >
                <div className="relative sm:w-24 sm:h-24 w-14 h-14 flex items-center justify-center p-3 sm:p-5">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    fill
                    className={`object-contain transition-all duration-500 group-hover/card:scale-110 group-hover/card:saturate-100 group-hover/card:opacity-100 saturate-[0.1] opacity-30 pointer-events-none md:pointer-events-auto select-none ${partner.scale || ""} ${partner.logoDark ? "dark:hidden" : ""} ${partner.logoDark ? "group-hover/card:hidden" : ""}`}
                    sizes="(max-width: 640px) 64px, 112px"
                  />
                  {partner.logoDark && (
                    <Image
                      src={partner.logoDark}
                      alt={`${partner.name} logo dark`}
                      fill
                      className={`object-contain transition-all duration-500 group-hover/card:scale-110 group-hover/card:saturate-100 group-hover/card:opacity-100 saturate-[0.1] opacity-30 pointer-events-none md:pointer-events-auto select-none hidden dark:block group-hover/card:hidden! ${partner.scale || ""}`}
                      sizes="(max-width: 640px) 64px, 112px"
                    />
                  )}
                  {partner.logoDark && (
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo hover`}
                      fill
                      className={`object-contain transition-all duration-500 group-hover/card:scale-110 group-hover/card:saturate-100 group-hover/card:opacity-100 saturate-[0.1] opacity-30 pointer-events-none md:pointer-events-auto select-none hidden group-hover/card:dark:block ${partner.scale || ""}`}
                      sizes="(max-width: 640px) 64px, 112px"
                    />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Gradient edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white dark:from-slate-950 to-transparent z-20 pointer-events-none transition-colors duration-300" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white dark:from-slate-950 to-transparent z-20 pointer-events-none transition-colors duration-300" />
      </div>
    </section>
  );
};

export default LandingPartners;
