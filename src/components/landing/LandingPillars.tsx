"use client";
import { motion } from "motion/react";
import Reveal from "@/components/motion/Reveal";
import type React from "react";

import {
  Crosshair,
  ShoppingBag,
  MessageSquare,
  Code,
  ArrowUpRight,
  Server,
} from "lucide-react";

// Type definitions
interface PillarsProps {
  header: string;
  subheader: string;
  content: string;
  icon?: React.ReactNode;
  className?: string; // For bento grid spans
  gradient?: string;
}

const PILLARS: PillarsProps[] = [
  {
    header: "Hardware & Accessories",
    subheader: "Curated Shop",
    content:
      "Premium workstation components, accessories, and mobile devices curated for high-performance productivity.",
    icon: <ShoppingBag className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    header: "IT Infrastructure",
    subheader: "Built to Scale",
    content:
      "Professional setup and management of server systems, POS, and secure enterprise networks.",
    icon: <Server className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-brand-secondary-500/20 to-green-500/20",
  },
  {
    header: "Managed Support",
    subheader: "On-Call Expertise",
    content:
      "Reliable IT support services including proactive monitoring, troubleshooting, and infrastructure maintenance.",
    icon: <MessageSquare className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    header: "Software Engineering",
    subheader: "Digital Ecosystem",
    content:
      "Custom web, mobile, and SaaS applications designed to integrate seamlessly with your physical infrastructure.",
    icon: <Code className="w-6 h-6" />,
    className: "md:col-span-3",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
];

const LandingPillars = () => {
  return (
    <section className="relative w-full py-12 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-black transition duration-500 opacity-50 dark:opacity-100" />
      <div className="absolute inset-0 hero-grid-pattern transition-opacity duration-300" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal direction="up" distance={20}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-brand-secondary-700 dark:text-brand-secondary-300 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 border border-brand-secondary-600/50 dark:border-brand-secondary-800/50 rounded uppercase">
              <Crosshair className="size-4" />
              Core Competencies
            </span>
          </Reveal>
          <Reveal direction="up" distance={30} delay={0.1}>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 transition duration-300">
              Our Expertise
            </h2>
          </Reveal>
          <Reveal direction="up" distance={40} delay={0.2}>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              A comprehensive ecosystem of services designed to accelerate your
              technological evolution.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.header}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden rounded bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-8 hover:border-brand-secondary-500/50 dark:hover:border-white/20 transition duration-300 ${pillar.className}`}
            >
              {/* Hover Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${pillar.gradient} opacity-0 group-hover:opacity-40 dark:group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white group-hover:scale-110 transition duration-300">
                    {pillar.icon}
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-brand-secondary-600 dark:group-hover:text-white transition-colors" />
                </div>

                <div className="mt-auto">
                  <h4 className="text-xs font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 mb-1 uppercase tracking-wider transition-colors duration-300">
                    {pillar.subheader}
                  </h4>
                  <h3 className="md:text-2xl text-lg font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">
                    {pillar.header}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    {pillar.content}
                  </p>
                </div>
              </div>

              {/* Decorative noise/texture (only in dark mode for more punch) */}
              <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none mix-blend-overlay">
                <svg className="w-full h-full">
                  <filter id="noise">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.60"
                      numOctaves="3"
                      stitchTiles="stitch"
                    />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPillars;
