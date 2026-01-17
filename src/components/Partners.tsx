import { motion } from "motion/react";

// Partner logos data
const PARTNERS = [
  { name: "Company 1", logo: "🚀" },
  { name: "Company 2", logo: "⚡" },
  { name: "Company 3", logo: "🎯" },
  { name: "Company 4", logo: "💎" },
  { name: "Company 5", logo: "🔥" },
  { name: "Company 6", logo: "⭐" },
  { name: "Company 7", logo: "🌟" },
  { name: "Company 8", logo: "✨" },
];

const Partners = () => {
  // Duplicate for seamless loop
  const duplicatedPartners = [...PARTNERS, ...PARTNERS];

  // Calculate animation distance
  const totalWidth = PARTNERS.length * 120; // Approximate width per item

  return (
    <section className="w-full py-10 bg-slate-50 dark:bg-slate-950/50 border-y border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="text-center mb-5">
        <p className="text-xs inline-block items-center mb-1 font-semibold text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-wider">
          Trusted By
        </p>
        <h2 className="text- font-bold text-slate-700 dark:text-slate-300">
          Leading Companies
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Scrolling Track */}
        <motion.div
          className="flex gap-4 items-center"
          animate={{
            x: [0, -totalWidth],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedPartners.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="shrink-0 flex flex-col items-center justify-center 
                         w-22 h-22 bg-white dark:bg-slate-900 
                         rounded border border-slate-200 dark:border-slate-800
                         hover:border-emerald-500 dark:hover:border-emerald-500
                         hover:shadow-lg hover:shadow-emerald-500/10
                         transition-all duration-300
                         group cursor-pointer"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {partner.logo}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium text-center px-2">
                {partner.name}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Optional: Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-slate-50 dark:from-slate-950/50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-slate-50 dark:from-slate-950/50 to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default Partners;
