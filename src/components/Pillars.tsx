import { motion, easeInOut } from "motion/react";
import FadeInView from "./motion/AnimateSection";
import { fadeIn } from "./motion/heroMotion";
import {
  AcademicCapIcon,
  CpuChipIcon,
  FinanceChart,
  Handshake,
  SeedSprout,
} from "@/assets/icons/icons";
import type React from "react";
import { Crosshair } from "lucide-react";

// Type definitions
interface PillarsProps {
  header: string;
  content: string;
  icon?: React.ReactNode;
  feature?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easeInOut,
    },
  },
};

const PILLARS: PillarsProps[] = [
  {
    header: "Technology",
    content:
      "We design and build scalable software, SaaS platforms, hardware and digital systems that solve real world problems and power modern businesses.",
    icon: <CpuChipIcon />,
  },
  {
    header: "Finance",
    content:
      "We design and build scalable software, SaaS platforms, hardware and digital systems that solve real world problems and power modern businesses.",
    icon: <FinanceChart />,
  },
  {
    header: "Investment",
    content:
      "We design and build scalable software, SaaS platforms, hardware and digital systems that solve real world problems and power modern businesses.",
    icon: <SeedSprout />,
  },
  {
    header: "Education",
    content:
      "We design and build scalable software, SaaS platforms, hardware and digital systems that solve real world problems and power modern businesses.",
    icon: <AcademicCapIcon />,
  },
  {
    header: "Humanity",
    content:
      "We design and build scalable software, SaaS platforms, hardware and digital systems that solve real world problems and power modern businesses.",
    icon: <Handshake />,
  },
];

const Pillars = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative w-full py-20 bg-slate-50 dark:bg-slate-950"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <FadeInView direction="up">
            {/* Header */}
            <motion.header 
              className="text-center mb-16" 
              variants={fadeIn}
            >
              <span className="inline-flex items-center px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Crosshair  className="me-2 size-4"/>
                Our Focus Areas
              </span>
              <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-200 mb-4">
                What We Do
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Transforming industries through innovation and expertise
              </p>
            </motion.header>

            {/* Cards Grid - 2 rows: 3 top, 2 bottom centered */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {PILLARS.slice(0, 3).map((pillar) => {
                return (
                  <motion.div
                    variants={cardVariants}
                    key={pillar.header}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                    className="group relative bg-white dark:bg-slate-900 rounded p-8 
                             border border-slate-200 dark:border-slate-800 
                             hover:border-emerald-500 dark:hover:border-emerald-500
                             hover:shadow-xl hover:shadow-emerald-500/10
                             transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center 
                                    w-16 h-16 rounded
                                    bg-gradient-to-br from-emerald-500/10 to-blue-500/10
                                    dark:from-emerald-500/20 dark:to-blue-500/20
                                    border border-emerald-500/20 dark:border-emerald-500/30
                                    group-hover:scale-110 group-hover:rotate-3
                                    transition-transform duration-300">
                        <span className="w-8 h-8 text-emerald-600 dark:text-emerald-400">
                          {pillar.icon}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3
                                 group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                                 transition-colors duration-300">
                      {pillar.header}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                      {pillar.content}
                    </p>

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 
                                  bg-gradient-to-br from-emerald-500/5 to-transparent 
                                  rounded-bl-full opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 -z-10" />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Bottom Row - 2 Cards Centered */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8 lg:max-w-3xl lg:mx-auto"
            >
              {PILLARS.slice(3, 5).map((pillar) => {
                return (
                  <motion.div
                    variants={cardVariants}
                    key={pillar.header}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                    className="group relative bg-white dark:bg-slate-900 rounded p-8 
                             border border-slate-200 dark:border-slate-800 
                             hover:border-emerald-500 dark:hover:border-emerald-500
                             hover:shadow-xl hover:shadow-emerald-500/10
                             transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center 
                                    w-16 h-16 rounded
                                    bg-gradient-to-br from-emerald-500/10 to-blue-500/10
                                    dark:from-emerald-500/20 dark:to-blue-500/20
                                    border border-emerald-500/20 dark:border-emerald-500/30
                                    group-hover:scale-110 group-hover:rotate-3
                                    transition-transform duration-300">
                        <span className="w-8 h-8 text-emerald-600 dark:text-emerald-400">
                          {pillar.icon}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3
                                 group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                                 transition-colors duration-300">
                      {pillar.header}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                      {pillar.content}
                    </p>

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 
                                  bg-gradient-to-br from-emerald-500/5 to-transparent 
                                  rounded-bl-full opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 -z-10" />
                  </motion.div>
                );
              })}
            </motion.div>
          </FadeInView>
        </div>
      </div>
    </motion.section>
  );
};

export default Pillars;