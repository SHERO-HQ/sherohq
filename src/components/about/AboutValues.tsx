"use client";
import { StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import { Lightbulb, ShieldCheck, Handshake, Target, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionBadge } from "@/components/common/SectionBadge";

const values = [
  {
    icon: Target,
    title: "Purpose",
    description:
      "We build with intention. Everything we create should solve a real problem and make a meaningful difference. Technology is only valuable when it improves lives, empowers businesses, or strengthens communities.",
    color: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    description:
      "We earn trust through honesty and accountability. We act ethically, communicate transparently, and stand behind our commitments. Trust is the foundation of every relationship we build.",
    color: "secondary",
  },
  {
    icon: Handshake,
    title: "Ownership",
    description:
      "We take responsibility and make things happen. We think like owners, take initiative, and see challenges through to completion. We don't wait for change, we create it.",
    color: "primary",
  },
  {
    icon: BadgeCheck,
    title: "Reliability",
    description:
      "We deliver with consistency and excellence. Our customers depend on us. We build dependable technology, provide reliable support, and strive for quality in everything we do.",
    color: "secondary",
  },
];

const AboutValues = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50/90 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-30"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16, 185, 129, 0.08), rgba(4, 50, 132, 0.04) 60%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 pattern-grid-brand opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <SectionBadge icon={Lightbulb} className="mb-4">
            Core Values
          </SectionBadge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3 transition-colors duration-300">
            Our Core Principles
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400 transition-colors duration-300 leading-relaxed">
            The foundational standards guiding every engineering decision, customer interaction, and partnership we build.
          </p>
        </div>

        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          staggerDelay={0.1}
          threshold={0.08}
        >
          {values.map((item, index) => (
            <StaggerItem key={item.title} yOffset={20} scale={0.98}>
              <div
                className={cn(
                  "group p-7 rounded bg-white dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between",
                  item.color === "primary" &&
                    "hover:border-brand-primary-500/40 dark:hover:border-brand-primary-500/40 hover:shadow-brand-primary-500/5",
                  item.color === "secondary" &&
                    "hover:border-brand-secondary-500/40 dark:hover:border-brand-secondary-500/40 hover:shadow-brand-secondary-500/5"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={cn(
                        "w-12 h-12 rounded flex items-center justify-center transition duration-300 border shadow-xs group-hover:scale-105",
                        item.color === "primary" &&
                          "bg-brand-primary-500/10 dark:bg-brand-primary-500/15 border-brand-primary-500/20 text-brand-primary-600 dark:text-brand-primary-400",
                        item.color === "secondary" &&
                          "bg-brand-secondary-500/10 dark:bg-brand-secondary-500/15 border-brand-secondary-500/20 text-brand-secondary-600 dark:text-brand-secondary-400"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
                      0{index + 1}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "text-lg font-bold text-slate-900 dark:text-white mb-2.5 transition-colors",
                      item.color === "primary" &&
                        "group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400",
                      item.color === "secondary" &&
                        "group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400"
                    )}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default AboutValues;
