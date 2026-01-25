import { motion } from "motion/react";
import { Briefcase } from "lucide-react";

// Partner logos data - Using techy names and clean styling
const PARTNERS = [
  { name: "NEXUS AI", logo: "NX" },
  { name: "QUANTUM", logo: "QT" },
  { name: "ETHERIUM", logo: "ET" },
  { name: "VELOCITY", logo: "VL" },
  { name: "ORACLE", logo: "OR" },
  { name: "TITAN", logo: "TT" },
  { name: "PRISM", logo: "PR" },
  { name: "SPARK", logo: "SP" },
];

const LandingPartners = () => {
  // Duplicate for seamless loop
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="w-full py-20 bg-white dark:bg-slate-950 relative overflow-hidden border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-20 transition-opacity duration-300" />

      {/* Header */}
      <div className="container mx-auto px-4 relative z-10 mb-12 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase tracking-wider transition-colors duration-300">
          <Briefcase className="w-4 h-4" />
          Strategic Alliances
        </span>
        <h2 className="text-2xl md:text-3xl font-sora font-bold text-slate-900 dark:text-white transition-colors duration-300">
          Trusted by Industry Innovators
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Scrolling Track */}
        <div className="flex overflow-hidden group">
          <motion.div
            className="flex gap-6 py-4"
            animate={{
              x: [0, -144 * PARTNERS.length], // Adjust based on item width + gap
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
            whileHover={{ transition: { duration: 60 } }} // Slow down on hover for "pause" effect
          >
            {duplicatedPartners.map((partner, idx) => (
              <div
                key={`${partner.name}-${idx}`}
                className="shrink-0 flex items-center justify-center gap-3 px-8 h-20 
                           bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded border border-slate-200 dark:border-white/5
                           hover:bg-emerald-500/10 hover:border-emerald-500/50
                           hover:shadow-lg hover:shadow-emerald-500/20
                           transition-all duration-300
                           cursor-pointer group/card"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded bg-emerald-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold group-hover/card:bg-emerald-500 group-hover/card:text-white transition-colors duration-300">
                  {partner.logo}
                </div>
                <span className="text-slate-600 dark:text-slate-300 font-sora font-semibold tracking-wide group-hover/card:text-white dark:group-hover/card:text-white transition-colors">
                  {partner.name}
                </span>
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
