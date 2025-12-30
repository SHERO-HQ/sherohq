import { motion } from "framer-motion";

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
  // Triple array for seamless infinite loop
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

  // Calculate total width to move (one complete set)
  const totalWidth = PARTNERS.length * (128 + 64); // width (128px) + gap (64px)

  return (
    <section className="w-full py-4 overflow-hidden">
      <div className="mx-auto">
        <h2 className=" font-bold text-sm text-center mb-2 text-slate-900 dark:text-slate-100">
          Trusted By Leading Companies
        </h2>

        {/* Carousel Container */}
        <div className="overflow-hidden">
          {/* Scrolling Track */}
          <motion.div
            className="flex gap-3"
            animate={{
              x: [0, -totalWidth],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 50,
                ease: "linear",
              },
            }}
          >
            {duplicatedPartners.map((partner, idx) => (
              <div
                key={idx}
                className="shrink-0 flex items-center justify-center p-2 m-2 transition-all"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{partner.logo}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {partner.name}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Partners;