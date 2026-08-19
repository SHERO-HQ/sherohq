"use client";
import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { Cpu, Code, Shield, Network } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";

const nodes = [
  {
    id: 1,
    title: "Reliable Hardware",
    desc: "We supply dependable, high-performance hardware foundations.",
    icon: Cpu,
  },
  {
    id: 2,
    title: "Custom Software",
    desc: "Engineered specifically to maximize your hardware.",
    icon: Code,
  },
  {
    id: 3,
    title: "Managed IT",
    desc: "Maintained by the very team that built it.",
    icon: Shield,
  },
];

const LandingEcosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 py-24 dark:bg-slate-950 border-y border-slate-200/50 dark:border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-brand-secondary-500/5 via-transparent to-transparent opacity-50 dark:from-brand-secondary-500/10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <SectionBadge icon={Network}>
              The Ecosystem Advantage
            </SectionBadge>
          </m.div>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Why Split IT when you can have{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-600 to-brand-secondary-500 dark:from-brand-primary-400 dark:to-brand-secondary-400">
              All-in-One
            </span>
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            Software redefined specifically for the hardware we supply,
            supported by the team that built it. When every piece works together
            seamlessly, businesses can move forward faster.
          </m.p>
        </div>

        {/* Interconnected Flow */}
        <div
          className="relative mx-auto max-w-5xl mt-16 sm:mt-24"
          ref={containerRef}
        >
          {/* Main Line Track (Mobile - Vertical) */}
          <div
            className="md:hidden absolute left-7 top-6 bottom-6 w-8 -translate-x-1/2 z-0 pointer-events-none"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            }}
          >
            {/* Background Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.75 -translate-x-1/2 bg-slate-200/70 dark:bg-slate-800/70" />
            {/* Scroll Filling Line */}
            <m.div
              style={{ scaleY: scrollProgress, originY: 0 }}
              className="absolute left-1/2 top-0 bottom-0 w-0.75 -translate-x-1/2 bg-brand-primary-500 shadow-[0_0_12px_rgba(16, 185, 129, 0.8)] dark:bg-brand-primary-400"
            />
          </div>

          {/* Main Line Track (Desktop - Horizontal) */}
          <div
            className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-8 -translate-y-1/2 z-0 pointer-events-none"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.75 -translate-y-1/2 bg-slate-200/70 dark:bg-slate-800/70" />
            {/* Scroll Filling Line */}
            <m.div
              style={{ scaleX: scrollProgress, originX: 0 }}
              className="absolute top-1/2 left-0 right-0 h-0.75 -translate-y-1/2 bg-brand-primary-500 shadow-[0_0_12px_rgba(16, 185, 129, 0.8)] dark:bg-brand-primary-400"
            />
          </div>

          {/* Nodes Container */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-12 md:gap-8 relative z-10">
            {nodes.map((node, index) => {
              const Icon = node.icon;

              return (
                <m.div
                  key={node.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 * index,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="relative flex flex-row md:flex-col items-start md:items-center gap-6"
                >
                  {/* Icon Node */}
                  <div className="relative z-10 flex shrink-0 h-12 w-12 items-center justify-center rounded bg-white shadow shadow-slate-200/50 dark:bg-slate-950 dark:border dark:border-slate-800 transition-transform duration-500 group-hover:scale-110">
                    <div className="absolute inset-0 rounded bg-brand-primary-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <Icon className="h-8 w-8 text-brand-primary-500 dark:text-brand-primary-400 transition-colors group-hover:text-brand-secondary-500" />
                  </div>

                  {/* Content Card */}
                  <div className="group flex-1 w-full relative z-10 p-4 md:p-6 rounded bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm md:text-center">
                    <h3 className="sm:text-lg text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                      {node.desc}
                    </p>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingEcosystem;
