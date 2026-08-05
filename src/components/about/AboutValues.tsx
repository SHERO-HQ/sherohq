"use client";
import { StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import { Lightbulb, ShieldCheck, Handshake, Rocket, Target, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: Target,
    title: "Purpose",
    description:
      "We build technology that matters. Every solution we create is driven by a commitment to empower people, strengthen businesses, and create lasting impact.",
    color: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    description:
      "We do what is right, even when no one is watching. Honesty, transparency, and ethical decision-making guide everything we do.",
    color: "secondary",
  },
  {
    icon: Handshake,
    title: "Ownership",
    description:
      "We take initiative, embrace responsibility, and see every challenge through. We act like builders, taking pride in our work and the impact it creates.",
    color: "primary",
  },
  {
    icon: BadgeCheck,
    title: "Reliability",
    description:
      "We earn trust through consistency. From our technology to our relationships, we deliver dependable solutions and stand behind our commitments.",
    color: "secondary",
  },
];

const AboutValues = () => {
  return (
    <section className="py-12 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-100/50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-black pointer-events-none transition duration-500" />

      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-10/12 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] uppercase font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded transition-colors duration-300">
            <Lightbulb className="size-4" />
            Core Values
          </span>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">
            Our Core Principles
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
            The guiding force behind every line of code we write and every
            solution we engineer.
          </p>
        </div>

        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-3"
          staggerDelay={0.1}
          threshold={0.08}
        >
          {values.map((item) => (
            <StaggerItem key={item.title} yOffset={20} scale={0.98}>
              <div
                className="group p-8 rounded bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-brand-secondary-500/30 shadow-sm hover:shadow hover:shadow-brand-secondary-500/5 transition duration-500 hover:-translate-y-2 h-full"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded flex items-center justify-center mb-4 transition duration-500 border border-slate-200/50 dark:border-white/5 shadow-sm",
                    item.color === "primary" &&
                    "bg-brand-primary-500/10 text-brand-primary-600 dark:text-brand-primary-400 group-hover:bg-brand-primary-600/50 group-hover:text-white group-hover:shadow group-hover:shadow-brand-primary-500/30",
                    item.color === "secondary" &&
                    "bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400 group-hover:bg-brand-secondary-600/50 group-hover:text-white group-hover:shadow group-hover:shadow-brand-secondary-500/30"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tighter group-hover:text-brand-secondary-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default AboutValues;
