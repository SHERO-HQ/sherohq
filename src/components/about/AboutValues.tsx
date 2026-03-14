"use client";
import { motion } from "motion/react";
import { Lightbulb, ShieldCheck, Handshake, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description:
      "We don't just follow trends; we set them. Our approach combines creative problem-solving with cutting-edge technology.",
    color: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Uncompromised Quality",
    description:
      "Excellence is our baseline. We adhere to strict coding standards and rigorous testing to ensure rock-solid performance.",
    color: "blue",
  },
  {
    icon: Handshake,
    title: "True Partnership",
    description:
      "We build relationships, not just software. Your success is our success, and we work as an extension of your team.",
    color: "violet",
  },
  {
    icon: Rocket,
    title: "Rapid Delivery",
    description:
      "Time is money. We optimize our workflows to deliver high-impact results without sacrificing quality or stability.",
    color: "amber",
  },
];

const AboutValues = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-100/50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-black pointer-events-none transition duration-500" />

      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-10/12 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/70 dark:border-emerald-800/50 rounded uppercase transition-colors duration-300">
            <Lightbulb className="w-4 h-4" />
            Core Values
          </span>
          <h2 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            Our Core Principles
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
            The guiding force behind every line of code we write and every
            solution we engineer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group p-8 rounded bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 transition duration-500"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded flex items-center justify-center mb-8 transition duration-500 border border-slate-200/50 dark:border-white/5 shadow-sm",
                  item.color === "emerald" &&
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30",
                  item.color === "blue" &&
                    "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30",
                  item.color === "violet" &&
                    "bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-500/30",
                  item.color === "amber" &&
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/30",
                )}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-sora text-slate-900 dark:text-white mb-3 uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors line-clamp-3">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutValues;
