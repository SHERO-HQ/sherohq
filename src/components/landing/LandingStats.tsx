import { motion, spring, useInView, type Variants } from "motion/react";
import { Activity, Globe, Users, Trophy } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
}

const LandingStats = () => {
  const stats: Stat[] = [
    {
      value: "1000",
      suffix: "+",
      label: "Happy Customers",
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      value: "1500",
      suffix: "+",
      label: "Products Delivered",
      icon: <Trophy className="w-6 h-6" />,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      value: "50",
      suffix: "+",
      label: "Global Partners",
      icon: <Globe className="w-6 h-6" />,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      value: "99",
      suffix: "%",
      label: "Client Satisfaction",
      icon: <Activity className="w-6 h-6" />,
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: spring, stiffness: 100 },
    },
  };

  return (
    <section className="relative w-full py-20 bg-white dark:bg-slate-950 overflow-hidden border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* HUD Background Graph/Grid */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none transition-opacity duration-300">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-emerald-600/30 dark:text-emerald-500/30"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] transition-colors duration-300" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto w-full md:w-10/12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} variants={itemVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Floating HUD Card
const StatCard = ({ stat, variants }: { stat: Stat; variants: Variants }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const target = parseInt(stat.value, 10);
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.2)",
      }}
      className="relative group bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300"
    >
      {/* Scanning Line Effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent -translate-y-full group-hover:animate-scan" />

      {/* Icon Ring */}
      <div
        className={`mb-4 p-3 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 ${stat.color} shadow-lg relative transition-colors duration-300`}
      >
        {stat.icon}
        <div
          className={`absolute inset-0 rounded-full ${stat.color} opacity-10 dark:opacity-20 blur-md`}
        />
      </div>

      {/* Number */}
      <div className="relative mb-1">
        <span className="text-4xl lg:text-5xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter transition-colors duration-300">
          {stat.prefix}
          {count.toLocaleString()}
          {stat.suffix}
        </span>

        {/* Glow behind number */}
        <div
          className={`absolute inset-0 ${stat.color.replace("dark:", "")} opacity-10 dark:opacity-20 blur-xl block transition-opacity duration-300`}
        />
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2 transition-colors duration-300">
        {stat.label}
      </p>

      {/* Corners */}
      <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-slate-300 dark:border-slate-500/30 transition-colors duration-300" />
      <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-slate-300 dark:border-slate-500/30 transition-colors duration-300" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-slate-300 dark:border-slate-500/30 transition-colors duration-300" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-slate-300 dark:border-slate-500/30 transition-colors duration-300" />
    </motion.div>
  );
};

export default LandingStats;
