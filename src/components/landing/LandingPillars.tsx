"use client";
import React from "react";
import { StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import Reveal from "@/components/motion/Reveal";
import { Zap, ShoppingBag, Server, MessageSquare, Code } from "lucide-react";

import { TerminalWidget } from "./pillars/TerminalWidget";
import { POSWidget } from "./pillars/POSWidget";
import { SLAWidget } from "./pillars/SLAWidget";
import { PharmasystWidget } from "./pillars/PharmasystWidget";
import { PillarCard, PillarProps } from "./pillars/PillarCard";

const PILLARS: PillarProps[] = [
  {
    header: "Hardware & Accessories",
    subheader: "Curated Shop",
    content:
      "We supply a wide range of high-quality hardware and accessories for your business needs. From Computers to Servers, we have everything you need to get the job done.",
    icon: <ShoppingBag className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-blue-500/20 to-cyan-500/20",
    glowColor: "rgba(6, 182, 212, 0.12)", // Cyan
    widget: <TerminalWidget />
  },
  {
    header: "Custom Softwares",
    subheader: "Tailored Solutions",
    content:
      "Custom software solutions for your business needs. Get one made for your business that integrates seamlessly with your existing systems and workflows.",
    icon: <Server className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-brand-secondary-500/20 to-green-500/20",
    glowColor: "rgba(59, 130, 246, 0.12)", // Blue
    widget: <POSWidget />
  },
  {
    header: "Managed IT Support",
    subheader: "On-Call Expertise",
    content:
      "Proactive infrastructure maintenance, monitoring and support services to keep your business running smoothly.",
    icon: <MessageSquare className="w-6 h-6" />,
    className: "md:col-span-1",
    gradient: "from-purple-500/20 to-pink-500/20",
    glowColor: "rgba(168, 85, 247, 0.12)", // Purple
    widget: <SLAWidget />
  },
  {
    header: "ERP & Custom Systems",
    subheader: "Digital Ecosystem",
    content:
      "Custom-engineered digital platforms for businesses, designed to integrate with existing systems and workflows.",
    icon: <Code className="w-6 h-6" />,
    className: "md:col-span-3",
    gradient: "from-brand-primary-500/20 to-brand-secondary-500/20",
    glowColor: "rgba(16, 185, 129, 0.12)", // Emerald
    widget: <PharmasystWidget />
  },
];

const LandingPillars = () => {
  return (
    <section className="relative w-full py-12 lg:py-16 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="pillar-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.60"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-55 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black transition duration-500 opacity-50 dark:opacity-100" />
      <div className="absolute inset-0 hero-grid-pattern transition-opacity duration-300" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <Reveal direction="up" distance={20}>
            <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded uppercase transition-colors duration-300">
              <Zap className="size-4" />
              What We've Built
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300 tracking-tight">
              Proven Platforms & Systems
            </h2>
          </Reveal>
          <Reveal direction="up" distance={40} delay={0.2}>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              A tactile look at the actual custom platforms, enterprise hardware
              systems, and managed support frameworks we build to keep
              operations clear.
            </p>
          </Reveal>
        </div>

        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          staggerDelay={0.12}
          threshold={0.08}
        >
          {PILLARS.map((pillar) => (
            <StaggerItem
              key={pillar.header}
              yOffset={20}
              scale={0.98}
              className={pillar.className}
            >
              <PillarCard pillar={pillar} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default LandingPillars;
