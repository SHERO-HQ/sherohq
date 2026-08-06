"use client";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import {
  Search,
  Lightbulb,
  Code2,
  Rocket,
  Workflow,
  Wrench,
  Shield,
} from "lucide-react";
import { useRef } from "react";
import { m, useScroll, useTransform, useInView } from "motion/react";

const steps = [
  {
    title: "Discovery & Consultation",
    description:
      "We dive deep into your business needs, assess your current infrastructure, and understand your technology goals.",
    icon: Search,
  },
  {
    title: "Strategy & Design",
    description:
      "Our experts craft a tailored solution encompassing hardware, software, network infrastructure, and security architecture.",
    icon: Lightbulb,
  },
  {
    title: "Implementation",
    description:
      "We build, install, and configure your complete technology stack - from hardware setup to custom software development.",
    icon: Code2,
  },
  {
    title: "Integration & Testing",
    description:
      "Rigorous testing ensures seamless integration of all systems, with security audits and performance optimization.",
    icon: Wrench,
  },
  {
    title: "Deployment & Training",
    description:
      "Smooth rollout with comprehensive staff training and knowledge transfer to ensure successful adoption.",
    icon: Rocket,
  },
  {
    title: "Support & Maintenance",
    description:
      "Ongoing monitoring, updates, hardware maintenance, and 24/7 IT support to keep your systems running optimally.",
    icon: Shield,
  },
];

const ProcessStep = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const isEven = index % 2 === 0;
  const Icon = step.icon;
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "10000px 0px -50% 0px" });

  return (
    <FadeInView direction="up" delay={0.05} threshold={0.1} once={true}>
      <div
        ref={ref}
        className={`relative flex items-center justify-between ${
          isEven ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Content Card */}
        <div className="w-full pl-14 md:pl-0 md:w-5/12">
          <div
            className={`relative p-6 rounded bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border transition-all duration-500 overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-secondary-900/20 ${
              isInView
                ? "border-brand-secondary-500/50 dark:border-brand-secondary-500/50 shadow-brand-secondary-500/10 shadow-lg md:scale-105 scale-102"
                : "border-slate-200/80 dark:border-slate-800/80 shadow-sm"
            } ${isEven ? "md:text-right" : "md:text-left"}`}
          >
            {/* Giant Number Watermark */}
            <div
              className={`absolute -bottom-4 ${
                isEven ? "md:-left-2 right-0" : "right-1 md:right-1"
              } text-[100px] font-black text-slate-900/10 dark:text-white/10 select-none pointer-events-none leading-none tracking-tighter transition-colors duration-500 ${
                isInView
                  ? "text-brand-secondary-500/10 dark:text-brand-secondary-400/10"
                  : "group-hover:text-brand-secondary-500/5"
              }`}
            >
              0{index + 1}
            </div>

            <div className="relative z-10">
              <h3
                className={`text-md md:text-lg font-bold tracking-tight mb-2 transition-colors duration-500 ${
                  isInView
                    ? "text-brand-secondary-600 dark:text-brand-secondary-400"
                    : "text-slate-900 dark:text-white group-hover:text-brand-secondary-500"
                }`}
              >
                {step.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Icon */}
        <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 flex items-center justify-center z-10">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full shadow flex items-center justify-center border-4 transition-all duration-500 ${
              isInView
                ? "bg-brand-secondary-600 dark:bg-brand-secondary-500 border-brand-secondary-100 dark:border-slate-800 scale-125 shadow-brand-secondary-500/50"
                : "bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900 scale-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 md:w-5 md:h-5 transition-colors duration-500 ${
                isInView ? "text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Empty Space (Desktop only - for alignment) */}
        <div className="hidden md:block w-5/12" />
      </div>
    </FadeInView>
  );
};

const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="py-16 bg-white dark:bg-slate-900 overflow-hidden relative border-t border-slate-200 dark:border-white/5 pattern-dots">
      <div className="absolute inset-0 hero-grid-pattern opacity-95 dark:opacity-90" />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Header - Staggered Scroll Reveal */}
        <StaggerContainer 
          as="div"
          className="text-center mb-10"
          staggerDelay={0.12}
        >
          <StaggerItem yOffset={25}>
            <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] uppercase font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded transition-colors duration-300">
              <Workflow className="size-4" />
              How We Work
            </span>
          </StaggerItem>
          <StaggerItem yOffset={25}>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Our Process
            </h2>
          </StaggerItem>
          <StaggerItem yOffset={25}>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A transparent, agile workflow designed to deliver exceptional
              results on time and within budget.
            </p>
          </StaggerItem>
        </StaggerContainer>

        <div className="relative" ref={containerRef}>
          {/* Timeline Lines Container with Fade Mask */}
          <div 
            className="absolute left-5 md:left-1/2 transform -translate-x-1/2 h-full w-px"
            style={{
              maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)"
            }}
          >
            {/* Background Line */}
            <div className="absolute inset-0 bg-slate-200/70 dark:bg-slate-800/70" />
            
            {/* Animated Active Line */}
            <m.div 
              style={{ scaleY, originY: 0 }}
              className="absolute inset-0 bg-brand-secondary-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] z-0" 
            />
          </div>

          {/* Scroll-Revealed Timeline Steps */}
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <ProcessStep key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
