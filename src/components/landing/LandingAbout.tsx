import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Globe2,
  Info,
  Zap,
} from "lucide-react";

const LandingAbout = () => {
  const features = [
    "Premium Tech Ecosystems",
    "Strategic Digital Transformation",
    "Global Partnership Network",
  ];

  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-500/5 rounded-full blur-[120px]" />
      </div>

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
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase">
                <Info className="w-5 h-5" />
                Who We Are
              </span>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100 leading-tight transition-colors duration-300">
                Empowering the <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-700 dark:from-blue-700 dark:to-emerald-500 transition-all duration-500">
                  Future of Tech
                </span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl transition-colors duration-300">
                SHERO is more than a tech company. We are architects of
                innovation, bridging the gap between hardware excellence and
                digital potential. Our mission is to redefine what is possible
                for businesses and individuals alike.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4">
              {features.map((item, index) => (
                <motion.li
                  key={index}
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
              <NavLink
                to="/about-us"
                className="group inline-flex items-center gap-2 text-slate-900 dark:text-white font-semibold border-b-2 border-emerald-500 pb-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Discover Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </NavLink>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Tech Nexus Visualization */}
          <div className="w-full lg:w-1/2 relative h-[500px] flex items-center justify-center">
            {/* Central Glass Card */}
            {/* Central Tech Nexus Visual */}
            {/* Central Glass Card */}
            {/* Central Tech Nexus Visual with Zap */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="relative z-20 w-80 h-80 rounded-full flex items-center justify-center bg-slate-900/10 backdrop-blur-sm border border-emerald-500/30"
            >
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" />

              {/* Rotating Rings */}
              <div className="absolute inset-4 border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-8 border border-emerald-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

              {/* Central Glowing Icon */}
              <div className="relative z-10 w-32 h-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center shadow-lg dark:shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md border border-emerald-200 dark:border-emerald-500/20">
                <Zap className="w-16 h-16 text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>

              {/* Floating Badge Overlay */}
              <div className="absolute bottom-10 right-5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded transform translate-y-1/2 shadow-lg">
                <p className="text-xs font-bold text-white tracking-wider">
                  10x
                </p>
                <p className="text-[10px] text-emerald-300"> Efficiency Impact</p>
              </div>
            </motion.div>

            {/* Floating Elements (Orbiting) */}
            <FloatingCard
              icon={
                <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              }
              label="Global Scale"
              className="absolute top-10 right-10 z-10"
              delay={0.8}
            />
            <FloatingCard
              icon={
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
              }
              label="Hardware"
              className="absolute bottom-20 left-0 z-30"
              delay={0.6}
            />
            <FloatingCard
              icon={
                <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              }
              label="Software"
              className="absolute bottom-10 right-20 z-10"
              delay={0.8}
            />

            {/* Abstract Background Mesh for Column */}
            <div
              className="absolute inset-10 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: "4s" }}
            />
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
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  delay: number;
}) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 },
      opacity: { duration: 0.5, delay },
    }}
    className={`flex items-center gap-3 px-4 py-3 rounded bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300 ${className}`}
  >
    {icon}
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-300">
      {label}
    </span>
  </motion.div>
);

export default LandingAbout;
