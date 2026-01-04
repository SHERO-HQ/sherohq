import { motion, useInView } from "framer-motion";
import { HeartPlus } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}

const Stats = () => {
  const stats: Stat[] = [
    {
      value: "1000",
      suffix: "+",
      label: "Happy Customers",
    },
    {
      value: "1500",
      suffix: "+",
      label: "Products Delivered",
    },
    {
      value: "3",
      suffix: "+",
      label: "Tech Partners",
    },
    {
      value: "100",
      suffix: "%",
      label: "Client Satisfaction",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative w-full py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
          <HeartPlus className="size-5"/>
            Our Impact
          </span>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-4">
            Growing Together
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Trusted by businesses and individuals who believe in the power of technology
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} variants={itemVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Separate component for animated counter
const StatCard = ({ 
  stat, 
  index, 
  variants 
}: { 
  stat: Stat; 
  index: number; 
  variants: any;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const target = parseInt(stat.value);
      const duration = 2000; // 2 seconds
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
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="group relative bg-slate-100 dark:bg-slate-900 rounded p-8 
               border border-slate-200 dark:border-slate-800
               hover:border-emerald-500 dark:hover:border-emerald-500
               hover:shadow-2xl hover:shadow-emerald-500/10
               transition-all duration-300"
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 
                    opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

      {/* Content */}
      <div className="relative text-center">
        {/* Number */}
        <div className="mb-3">
          <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
            {stat.prefix}
            {count.toLocaleString()}
            {stat.suffix}
          </span>
        </div>

        {/* Label */}
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {stat.label}
        </p>
      </div>

      {/* Decorative dot */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default Stats;