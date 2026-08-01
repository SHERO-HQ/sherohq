"use client";
import { motion } from "motion/react";

import type { Variants } from "motion/react";
import AppImage from "../common/AppImage";
import { Particles } from "@/components/ui/particles";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const AboutFounder = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-slate-50 dark:bg-slate-950/50">
      <Particles count={80} color="148, 163, 184" className="opacity-80" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          className="max-w-3xl mx-auto"
        >
          {/* Centered layout */}
          <motion.div variants={fadeUp} className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center size-20 mb-6 bg-white dark:bg-transparent rounded p-2">
              <AppImage
                src="/assets/logo/shero.png"
                alt="SHERO Logo"
                width={80}
                height={80}
                className="rounded"
              />
            </div>

            {/* Label */}
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-brand-secondary-500 dark:text-brand-secondary-400 font-bold mb-4">
              Founder's Message
            </h2>

            {/* Quote */}
            <blockquote className="relative text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed italic max-w-2xl mx-auto pb-6">
              <span className="absolute -top-4 -left-2 text-6xl text-brand-primary-300/20 font-serif select-none" aria-hidden="true">&ldquo;</span>
              The best technology shouldn't be hard to find, hard to afford, or hard to trust.
              We built SHERO so that every individual, business or community, no matter the size, gets access to reliable, enterprise-quality technology.
              <span className="absolute -bottom-4 -right-2 text-6xl text-brand-primary-300/20 font-serif select-none" aria-hidden="true">&rdquo;</span>
            </blockquote>

            {/* Tagline */}
            <motion.p
              variants={fadeUp}
              className="mt-8 text-base md:text-lg font-bold tracking-wide bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500 bg-clip-text text-transparent uppercase"
            >
              Redefine Possible.
            </motion.p>

            {/* Attribution */}
            <motion.p variants={fadeUp} className="mt-4 text-xs text-muted-foreground">
              — Founder, SHERO
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutFounder;
