"use client";
import UniversalLink from "@/components/common/UniversalLink";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Globe2,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const LandingAbout = () => {
  const features = [
    "Premium Tech Ecosystems",
    "Strategic Digital Transformation",
    "Global Partnership Network",
  ];

  return (
    <section className="relative w-full py-12 lg:py-16 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pattern-grid-emerald opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          {/* LEFT COLUMN: Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 space-y-10"
          >
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded uppercase">
                <Info className="w-5 h-5" />
                Who We Are
              </span>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100 leading-tight transition-colors duration-300">
                Redefining{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-700 dark:from-blue-700 dark:to-emerald-500 transition-all duration-500">
                  Possibilities
                </span>
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl transition-colors duration-300">
                SHERO is more than a tech company. We are architects of
                innovation, bridging the gap between hardware excellence and
                digital potential. Our mission is to redefine what is possible
                for communities, businesses and individuals alike.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4">
              {features.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {item}
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <div className="pt-2">
              <UniversalLink
                to="/about-us"
                className="group inline-flex items-center gap-2 text-slate-900 dark:text-white font-semibold border-b-2 border-emerald-500 pb-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Discover Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </UniversalLink>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Tech Nexus Visualization */}
          <div className="w-full lg:w-1/2 relative h-125 flex items-center justify-center">
            <div className="absolute inset-0 pattern-dots mask-radial-faded" />

            <motion.div
              // initial={{ scale: 0.9, opacity: 0 }}
              // whileInView={{ scale: 1, opacity: 1 }}
              // transition={{ duration: 0.8, ease: "circOut" }}
              className="relative z-20 w-80 h-80 rounded-full flex items-center justify-center border-2 border-emerald-500/20"
            >
              {/* Rotating Rings */}
              <div className="absolute inset-4 border-2 border-emerald-500/30 rounded-full" />
              <div className="absolute inset-8 border-2 border-emerald-400/20 rounded-full" />

              {/* Central Pattern Centerpiece */}
              <div className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center border border-emerald-500/10 overflow-hidden">
                {/* Pattern as the 'Glow' */}
                <div className="absolute inset-0 pattern-dots opacity-40 dark:opacity-60 mask-radial-faded scale-150" />

                {/* The Icon itself (Restored) */}
                <img
                  src="/assets/logo/shero.svg"
                  alt="SHERO"
                  className="relative z-20 w-16 h-16 text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                />
              </div>

              {/* Floating Badge Overlay */}
              <div className="absolute -top-24 right-0 dark:bg-emerald-50/10 bg-white/40 backdrop-blur-md border border-white/20 dark:border-emerald-500/20 px-4 py-2 font-sora rounded transform translate-y-1/2 shadow-lg">
                <p className="text-sm font-bold dark:text-white text-slate-600 tracking-wider">
                  10x
                </p>
                <p className="text-xs dark:text-emerald-300 text-emerald-600 tracking-wider">
                  {" "}
                  Efficiency Impact
                </p>
              </div>
            </motion.div>

            {/* Floating Elements (Orbiting) */}
            <FloatingCard
              icon={
                <Globe2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-800 dark:text-blue-700" />
              }
              className="absolute sm:top-10 sm:right-20 md:top-8 md:right-28 top-30 left-10 z-10"
              // delay={0.8}
            />
            <FloatingCard
              icon={
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-indigo-800 dark:text-indigo-700" />
              }
              className="absolute bottom-25 sm:left-40 md:left-20 left-15 z-30"
              // delay={0.6}
            />
            <FloatingCard
              icon={
                <Code2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-800 dark:text-teal-600" />
              }
              className="absolute sm:bottom-1/3 sm:right-38 md:right-14 bottom-60 right-2 -translate-y-10 z-10"
              // delay={0.8}
            />

            {/* Abstract Background Mesh for Column */}
            <div className="absolute inset-10 pattern-grid-emerald opacity-10 dark:opacity-20 mask-radial-faded rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper for floating cards
const FloatingCard = ({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label?: string;
  className?: string;
}) => (
  <div className={`${className}`}>
    <Card
      className={`flex items-center justify-center ${label ? "gap-3 px-4 py-2" : "p-3"} border-none bg-transparent transition-all duration-300 shadow-none`}
    >
      {icon}
      {label && (
        <span className="text-sm font-semibold user-select-none">{label}</span>
      )}
    </Card>
  </div>
);

export default LandingAbout;
