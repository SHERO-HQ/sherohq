"use client";

import React from "react";
import Link from "next/link";
import { Server, ArrowRight, MessageSquare } from "lucide-react";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { SectionBadge } from "@/components/common/SectionBadge";
import { m } from "motion/react";

export const HardwareServiceLine: React.FC = () => {
  return (
    <section id="hardware-services" className="relative w-full py-16 sm:py-20 bg-muted/30 dark:bg-muted/10 border-y border-border overflow-hidden transition-colors">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-block"
          >
            <SectionBadge icon={Server}>
              Hardware as a Service
            </SectionBadge>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground font-sora"
          >
            Hardware for Your Team
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Tell us what you need — laptops, servers, or networking — and we will help you source and set it up.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="https://wa.me/233548711582"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-2xs hover:shadow-sm"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              Chat on WhatsApp
            </a>

            <Link
              href="/consultation?service=hardware"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-card hover:bg-muted text-foreground border border-border font-medium text-sm transition-all shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-brand-secondary-600 dark:text-brand-secondary-400" />
              Book Hardware Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </m.div>
        </div>

      </div>
    </section>
  );
};

export default HardwareServiceLine;
