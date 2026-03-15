import Image from "next/image";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";

// Partner/brand logos - real brands SHERO works with
const PARTNERS = [
 { name: "HP", logo: "/assets/images/partners/hp.png" },
 { name: "Dell", logo: "/assets/images/partners/dell.png" },
 { name: "Lenovo", logo: "/assets/images/partners/lenovo.png" },
 { name: "JBL", logo: "/assets/images/partners/jbl.png" },
 { name: "Apple", logo: "/assets/images/partners/apple.png" },
 { name: "Samsung", logo: "/assets/images/partners/samsung.png" },
 { name: "Nvidia", logo: "/assets/images/partners/nvidia.png" },
 { name: "Intel", logo: "/assets/images/partners/intel.png" },
];

const LandingPartners = () => {
 // Duplicate for seamless loop
 const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

 return (
 <section className="w-full py-12 bg-white dark:bg-slate-950 relative overflow-hidden border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
 {/* Background Ambience */}
 <div className="absolute inset-0 pattern-dots opacity-80 dark:opacity-25 transition-opacity duration-300" />

 {/* Header */}
 <div className="container mx-auto px-4 relative z-10 mb-8 text-center">
 <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase tracking-wider transition-colors duration-300">
 <Briefcase className="w-4 h-4" />
 Trusted Brands
 </span>
 <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
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
 <div className="relative sm:w-32 sm:h-32 w-20 h-20 flex items-center justify-center">
 <Image
 src={partner.logo}
 alt={`${partner.name} logo`}
 fill
 className="object-contain transition-transform duration-500 group-hover/card:scale-110 pointer-events-none md:pointer-events-auto select-none"
 sizes="250px"
 />
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
