"use client";

import React from "react";
import Link from "next/link";
import { Laptop, Server, Network, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { SectionBadge } from "@/components/common/SectionBadge";
import { m } from "motion/react";

const HARDWARE_PILLARS = [
  {
    icon: Laptop,
    category: "Supply & Setup",
    title: "Business Computers",
    desc: "Dependable laptops and desktop workstations procured, pre-configured with required software, and deployed for team workflows.",
    highlights: ["Staff laptops & workstations", "OS & software provisioning", "Device onboarding & replacement"],
  },
  {
    icon: Server,
    category: "Compute & Storage",
    title: "Enterprise Servers",
    desc: "High-uptime servers, firewall appliances, and rack infrastructure deployed to keep business applications and data reliable.",
    highlights: ["Rackmount & tower servers", "Firewall & security appliances", "Uptime & performance health"],
  },
  {
    icon: Network,
    category: "Infrastructure & Maintenance",
    title: "Networking Equipment",
    desc: "Commercial routers, managed switches, and structured cabling planned, installed, and maintained for uninterrupted operations.",
    highlights: ["Managed switches & Wi-Fi", "Structured office cabling", "Ongoing maintenance & support"],
  },
];

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
            Commercial Hardware Deployed for Your Team
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            From staff laptops and high-uptime server racks to structured office networking,
            we specify, pre-configure, and deliver dependable equipment ready for daily business.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {HARDWARE_PILLARS.map((item, index) => {
            const Icon = item.icon;
            return (
              <m.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="rounded-md bg-card border border-border p-6 flex flex-col justify-between hover:border-brand-secondary-500/40 transition-all shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:border-brand-secondary-500/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HardwareServiceLine;
