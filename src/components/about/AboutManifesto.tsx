"use client";
import React from "react";
import { Cpu, Shield, Headphones, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";

const pillars = [
  {
    icon: Cpu,
    title: "Hardware",
    badge: "Infrastructure",
    description:
      "High-performance laptops, enterprise servers, and networking equipment sourced from trusted global partners.",
    color: "secondary",
    href: "/products",
    linkText: "Explore Hardware",
  },
  {
    icon: Shield,
    title: "Software",
    badge: "Custom Solutions",
    description:
      "Custom-engineered digital solutions built for your workflow, with zero off-the-shelf compromises.",
    color: "primary",
    href: "/solutions",
    linkText: "Explore Solutions",
  },
  {
    icon: Headphones,
    title: "Managed IT",
    badge: "Operations",
    description:
      "Reliable IT management and proactive infrastructure support so your team focuses on growth.",
    color: "secondary",
    href: "/solutions",
    linkText: "Learn More",
  },
] as const;

const AboutManifesto = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden relative border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      {/* High-performance CSS ambient glow overlay (No canvas JS loops or expensive CSS filter blurs) */}
      <div 
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-125 pointer-events-none opacity-60 dark:opacity-30"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(16, 185, 129, 0.12), rgba(4, 50, 132, 0.06) 60%, transparent 100%)",
        }}
      />
      
      {/* Decorative dot pattern */}
      <div className="absolute inset-0 pattern-dots opacity-60 dark:opacity-40 pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        <FadeInView direction="up" delay={0}>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Section Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-[9px] font-bold uppercase tracking-wider text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100/80 dark:bg-brand-secondary-500/10 border border-brand-secondary-500/30 dark:border-brand-secondary-500/20 rounded transition-colors duration-300">
              <Trophy className="size-3.5" />
              Our Manifesto
            </span>

            {/* Main Headline Statement */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 transition-colors duration-300 leading-tight">
              We don't just build technology. We build{" "}
              <span className="font-bold bg-linear-to-r from-brand-secondary-600 via-brand-primary-600 to-brand-secondary-600 dark:from-brand-secondary-400 dark:via-brand-primary-300 dark:to-brand-secondary-400 bg-clip-text text-transparent">
                what moves businesses forward.
              </span>
            </h2>

            {/* Narrative Paragraphs */}
            <div className="space-y-3 text-slate-600 dark:text-slate-300/90 text-base md:text-lg leading-relaxed max-w-2xl">
              <p>
                Technology should expand what's possible, remove operational barriers, and unlock new opportunities for growth.
              </p>
              <p>
                We engineer software, deliver reliable hardware, and manage IT infrastructure so your organization can innovate with total confidence.
              </p>
              <p className="text-base md:text-lg font-bold bg-linear-to-r from-brand-secondary-600 to-brand-primary-600 dark:from-brand-secondary-400 dark:to-brand-primary-300 bg-clip-text text-transparent pt-2">
                Redefine Possible
              </p>
            </div>

            {/* Primary Action CTA */}
            <div className="mt-8">
              <Button
                variant="brand"
                size="lg"
                className="group text-base px-8 py-3 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded font-bold transition-all shadow shadow-brand-secondary-500/20 hover:-translate-y-0.5 hover:shadow-brand-secondary-500/40 cursor-pointer"
                asChild
              >
                <NavLink href={getAbsoluteUrl("/contact-us")}>
                  Work With Us
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </Button>
            </div>
          </div>
        </FadeInView>

        {/* 3 Pillars Grid Section (Signal Block Pattern) */}
        <div className="mt-16 md:mt-20">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.title} yOffset={20} scale={0.98}>
                <div className="group h-full p-8 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 hover:border-brand-secondary-500/40 dark:hover:border-brand-secondary-500/40 shadow-xs hover:shadow-lg hover:shadow-brand-secondary-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded flex items-center justify-center bg-brand-secondary-500/10 dark:bg-brand-secondary-500/15 border border-brand-secondary-500/20 text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:scale-105 transition-transform duration-300">
                        <pillar.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700/60">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    <NavLink
                      href={getAbsoluteUrl(pillar.href)}
                      className="inline-flex items-center text-xs font-bold text-brand-secondary-600 dark:text-brand-secondary-400 hover:text-brand-secondary-700 dark:hover:text-brand-secondary-300 group/link transition-colors"
                    >
                      {pillar.linkText}
                      <ArrowRight className="ml-1 size-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </NavLink>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Attribution Footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic max-w-xl mx-auto">
            &ldquo;Every interaction with SHERO should leave you with more possibilities than you had before.&rdquo;
          </p>
          <span className="inline-block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
            SHERO HQ · ESTABLISHING THE STANDARD
          </span>
        </div>
      </div>
    </section>
  );
};

export default AboutManifesto;
