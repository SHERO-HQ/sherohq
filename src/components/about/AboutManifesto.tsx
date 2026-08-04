"use client";
import { motion } from "motion/react";
import { Shield, Cpu, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { Particles } from "@/components/ui/particles";

import type { Variants } from "motion/react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const pillars = [
  {
    icon: Cpu,
    title: "Hardware",
    description: "Enterprise-grade laptops, servers, and networking equipment sourced from trusted global partners.",
  },
  {
    icon: Shield,
    title: "Software",
    description: "Custom-engineered solutions built for your exact workflow, no off-the-shelf compromises.",
  },
  {
    icon: Headphones,
    title: "Managed IT",
    description: "24/7 infrastructure management so your team focuses on growth, not troubleshooting.",
  },
] as const;

const AboutManifesto = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Dark gradient hero block */}
      <div className="relative bg-gradient-to-br from-slate-950 via-brand-primary-900 to-slate-950 py-14 sm:pt-28i">
        {/* Particles */}
        <Particles count={80} color="255, 255, 255" className="opacity-60" />

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-secondary-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="max-w-5xl mx-auto"
          >
            {/* Label */}
            {/* <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-10">
              <div className="h-px w-12 bg-brand-secondary-500/50" />
              <span className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-brand-secondary-400 font-bold">
                Our Manifesto
              </span>
              <div className="h-px w-12 bg-brand-secondary-500/50" />
            </motion.div> */}

            {/* Big quote with decorative marks */}
            <motion.blockquote variants={fadeUp} className="relative text-center pt-4 md:py-16 mx-auto">
              {/* Huge background watermark quote */}
              <span
                className="absolute mt-16 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[240px] md:text-[450px] leading-none font-serif text-brand-primary-400/20 select-none pointer-events-none -z-10"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <p className="text-3xl lg:text-5xl font-bold leading-[1.2] tracking-tight text-white relative z-10">
                We don't just build technology. We build {" "}
                <span className="bg-gradient-to-r from-brand-secondary-400 via-brand-primary-300 to-brand-secondary-400 bg-clip-text text-transparent">
                  what moves businesses forward.
                </span>
              </p>
            </motion.blockquote>

            <motion.div variants={fadeUp} className="mt-8 mx-auto max-w-6xl space-y-5">
              <p className="text-base md:text-lg text-slate-300/80 leading-relaxed">
                They said world-class technology required enormous budgets, complex systems,
                and impossible trade-offs.
              </p>

              <p className="text-base md:text-lg text-slate-300/80 leading-relaxed">
                We believed there was a better way. So we built SHERO to engineer software,
                deliver reliable hardware, and provide technology solutions that help
                businesses innovate, operate efficiently, and grow with confidence.
              </p>

              <p className="text-base text-center md:text-lg text-slate-300/80 leading-relaxed">
                <span className="bg-gradient-to-r from-brand-secondary-400 to-brand-primary-300 bg-clip-text text-transparent font-bold">
                  Redefining What's Possible.
                </span>
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex justify-center mt-10">
              <Button
                variant="brand"
                size="lg"
                className="group text-base px-8"
                asChild
              >
                <NavLink href={getAbsoluteUrl("/contact-us")}>
                  Work With Us
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </Button>
            </motion.div>

            {/* Attribution */}
            <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-3">
              <span className="text-sm font-bold text-white/60 uppercase tracking-widest">SHERO HQ</span>
              <span className="text-sm text-white/30 font-mono">·</span>
              <span className="text-sm text-white/40 font-mono">Establishing the Standard</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Three Pillars — sits right below the dark block */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-border">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={fadeUp}
                className="group text-center p-8 rounded border border-slate-200 dark:border-border bg-slate-50 dark:bg-card/40 hover:border-brand-primary-300 dark:hover:border-brand-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary-500/5"
              >
                <div className="inline-flex items-center justify-center size-14 rounded bg-brand-primary-50 dark:bg-brand-primary-900/20 border border-brand-primary-100 dark:border-brand-primary-800 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <pillar.icon className="size-6 text-brand-primary-600 dark:text-brand-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{pillar.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutManifesto;
