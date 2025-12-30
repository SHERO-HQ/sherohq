import { motion, easeInOut } from "motion/react";
// import { NavLink } from "react-router-dom";
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

// Type definitions
interface PillarsProps {
  header: string;
  content: string;
  icon?: React.ReactNode;
  feature?: boolean;
}

// Framer
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
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
      className="relative w-full py-10 border-slate-300 dark:border-slate-700 dark:bg-slate-950"
    >
      <div className="container lg:max-w-10/12 max-w-11/12 w-full mx-auto flex lg:flex-row flex-col justify-between gap-5 items-center">
        <div className="w-full mx-auto mt-10 lg:mt-0">
          <FadeInView direction="up">
            <motion.header className="mx-auto relative" variants={fadeIn}>
              <h2 className="lg:text-6xl md:text-5xl text-4xl dark:text-emerald-500 text-secondary font-inter font-bold relative z-10">
                Our Pillars
              </h2>
              <div className=" absolute lg:w-56 lg:left-38 lg:-mt-4 md:w-46 left-24 md:-mt-3 w-46 -mt-3"></div>
            </motion.header>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 mt-6"
            >
              {PILLARS.map((pillar) => {
                return (
                  <motion.div
                    variants={cardVariants}
                    key={pillar.header}
                    className={`rounded w-full h-full border border-slate-300 dark:border-slate-800 p-4 space-y-3 shadow-sm`}
                  >
                    <div className="content space-y-3 inline-flex items-center space-x-2">
                      <div className="icon size-12 p-1.5 border border-slate-300 dark:border-slate-800 shadow-sm drop-shadow-2xl text-primary/80 bg-blue-200/40 dark:text-secondary dark:bg-emerald-200/10 rounded flex self-center">
                        <span aria-label="pillar icon" className="size-10">
                          {pillar.icon}
                        </span>
                      </div>
                      <h2
                        className="md:text-3xl text-2xl font-bold text-primary dark:text-emerald-400 flex items-center"
                        aria-label="pillar header"
                      >
                        {pillar.header}
                      </h2>
                    </div>

                    <p
                      className="text-slate-900 dark:text-slate-400 leading-relaxed"
                      aria-label="pillar content"
                    >
                      {pillar.content}
                    </p>
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
