import { motion } from "motion/react";
import {
  Search,
  Lightbulb,
  Code2,
  Rocket,
  Workflow,
  Wrench,
  Shield,
} from "lucide-react";

const steps = [
  {
    title: "Discovery & Consultation",
    description:
      "We dive deep into your business needs, assess your current infrastructure, and understand your technology goals.",
    icon: Search,
  },
  {
    title: "Strategy & Design",
    description:
      "Our experts craft a tailored solution encompassing hardware, software, network infrastructure, and security architecture.",
    icon: Lightbulb,
  },
  {
    title: "Implementation",
    description:
      "We build, install, and configure your complete technology stack - from hardware setup to custom software development.",
    icon: Code2,
  },
  {
    title: "Integration & Testing",
    description:
      "Rigorous testing ensures seamless integration of all systems, with security audits and performance optimization.",
    icon: Wrench,
  },
  {
    title: "Deployment & Training",
    description:
      "Smooth rollout with comprehensive staff training and knowledge transfer to ensure successful adoption.",
    icon: Rocket,
  },
  {
    title: "Support & Maintenance",
    description:
      "Ongoing monitoring, updates, hardware maintenance, and 24/7 IT support to keep your systems running optimally.",
    icon: Shield,
  },
];

const Process = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden relative border-t border-slate-200 dark:border-white/5">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-20" />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/50 dark:border-emerald-800/50 rounded-full uppercase">
            <Workflow className="size-4" />
            How We Work
          </span>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-white mb-6">
            Our Process
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A transparent, agile workflow designed to deliver exceptional
            results on time and within budget.
          </p>
        </div>

        <div className="relative">
          {/* Central Timeline Line */}
          <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`relative flex items-center justify-between ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  {/* Content Card */}
                  <div className="w-full pl-14 md:pl-0 md:w-5/12">
                    <div
                      className={`p-6 rounded bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 group ${
                        isEven ? "md:text-right" : "md:text-left"
                      }`}
                    >
                      <span className="inline-block py-1 px-3 rounded mb-3 text-sm font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                        Step {index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Icon */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-emerald-600 dark:bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 transition-transform hover:scale-110">
                      <Icon className="w-6 h-6 md:w-10 md:h-10 text-white" />
                    </div>
                  </div>

                  {/* Empty Space (Desktop only - for alignment) */}
                  <div className="hidden md:block w-5/12" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
