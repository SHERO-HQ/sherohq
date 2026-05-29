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

const Process = () => {
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
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

        <div className="relative">
          {/* Central Timeline Line */}
          <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 h-full w-px bg-linear-to-b from-transparent via-brand-secondary-500/50 to-transparent" />

          {/* Scroll-Revealed Timeline Steps */}
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <FadeInView
                  key={step.title}
                  direction="up"
                  delay={0.05}
                  threshold={0.1}
                  once={true}
                >
                  <div
                    className={`relative flex items-center justify-between ${
                      isEven ? "md:flex-row-reverse" : "md:flex-row"
                    }`}
                  >
                    {/* Content Card */}
                    <div className="w-full pl-14 md:pl-0 md:w-5/12">
                      <div
                        className={`p-6 rounded bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5  hover:border-brand-secondary-500/30 transition hover:-translate-y-1 hover:shadow hover:shadow-brand-secondary-900/20 group ${
                          isEven ? "md:text-right" : "md:text-left"
                        }`}
                      >
                        <span className="inline-block py-1 px-2 rounded mb-3 text-sm font-semibold bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400 border border-brand-secondary-500/20 uppercase italic">
                           Step {index + 1}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 group-hover:text-brand-secondary-500 dark:group-hover:text-brand-secondary-400 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Icon */}
                    <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 flex items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-secondary-600 dark:bg-brand-secondary-500 shadow shadow-brand-secondary-500/30 flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 transition-transform hover:scale-110">
                        <Icon className="w-5 h-5 md:w-5 md:h-5 text-white" />
                      </div>
                    </div>

                    {/* Empty Space (Desktop only - for alignment) */}
                    <div className="hidden md:block w-5/12" />
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
