"use client";
import React from "react";
import { Cpu, Shield, ArrowRight, Compass, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/components/common/SectionBadge";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";

const pillars = [
  {
    icon: Cpu,
    title: "Hardware",
    badge: "Infrastructure",
    description:
      "High-performance laptops, enterprise servers, and networking equipment configured for modern business operations.",
    color: "secondary",
    href: "/consultation?service=hardware",
    linkText: "Consult Hardware",
  },
  {
    icon: Shield,
    title: "Software",
    badge: "Custom Solutions",
    description:
      "Custom-engineered digital solutions built for your workflow, with zero off-the-shelf compromises.",
    color: "primary",
    href: "/consultation?service=software",
    linkText: "Consult Software",
  },
  {
    icon: Headset,
    title: "Managed IT",
    badge: "Operations",
    description:
      "Hands-on IT support so your team can focus on growth.",
    color: "secondary",
    href: "/consultation?service=managed-it",
    linkText: "Consult Managed IT",
  },
] as const;

const AboutManifesto = () => {
  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28 bg-white dark:bg-slate-950 overflow-hidden relative border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        <FadeInView direction="up" delay={0}>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Section Badge */}
            <SectionBadge icon={Compass} className="mb-4">
              About SHERO
            </SectionBadge>

            {/* Main Headline Statement */}
            <h1 className="text-4xl sm:text-5xl  font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 transition-colors leading-[1.15]">
              We don&apos;t just build technology. <br className="hidden sm:inline" />
              We build{" "}
              <span className="text-brand-secondary-600 dark:text-brand-secondary-400">
                what moves businesses forward.
              </span>
            </h1>

            {/* Narrative Paragraphs */}
            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              <p>
                Technology should expand what&apos;s possible, remove operational barriers, and create real opportunities for sustainable growth.
              </p>
              <p>
                From custom software engineering to hardware sourcing and IT support, we build infrastructure your organization can rely on every single day.
              </p>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              <Button
                variant="brand"
                size="lg"
                className="w-full sm:w-auto group text-sm sm:text-base px-8 py-3 bg-brand-secondary-700 hover:bg-brand-secondary-800 text-white rounded font-semibold transition-all shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
                asChild
              >
                <NavLink href={getAbsoluteUrl("/contact-us")}>
                  Work With Us
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </Button>

              <NavLink
                href={getAbsoluteUrl("/consultation")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/90 dark:hover:bg-slate-800/80 active:bg-slate-300/80 dark:active:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded font-semibold text-sm transition-all hover:-translate-y-0.5"
              >
                Book Consultation
              </NavLink>
            </div>
          </div>
        </FadeInView>

        {/* 3 Pillars Grid Section (Signal Block Pattern) */}
        <div className="mt-16 md:mt-20">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.title} yOffset={20} scale={0.98}>
                <div className="group h-full p-8 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 hover:border-brand-secondary-500/40 dark:hover:border-brand-secondary-500/40 shadow-xs hover:shadow-lg hover:shadow-brand-secondary-500/5 transition-all hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded flex items-center justify-center bg-brand-secondary-500/10 dark:bg-brand-secondary-500/15 border border-brand-secondary-500/20 text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:scale-105 transition-transform ">
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
                      className="inline-flex items-center text-xs font-bold text-brand-secondary-700 dark:text-brand-secondary-400 hover:text-brand-secondary-800 dark:hover:text-brand-secondary-300 group/link transition-colors"
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
          <span className="inline-block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
            SHERO HQ · EXPANDING WHAT&apos;S POSSIBLE
          </span>
        </div>
      </div>
    </section>
  );
};

export default AboutManifesto;
