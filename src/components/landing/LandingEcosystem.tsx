"use client";
import { motion } from "motion/react";
import { Cpu, Code, Shield, Network } from "lucide-react";

const nodes = [
  {
    id: 1,
    title: "Premium Hardware",
    desc: "We supply the enterprise-grade physical foundation.",
    icon: Cpu,
  },
  {
    id: 2,
    title: "Custom Software",
    desc: "Engineered specifically to maximize your hardware.",
    icon: Code,
  },
  {
    id: 3,
    title: "Managed IT",
    desc: "Maintained by the very team that built it.",
    icon: Shield,
  },
];

const LandingEcosystem = () => {
  return (
    <section className="relative w-full overflow-hidden bg-slate-50 py-24 dark:bg-slate-950 border-y border-slate-200/50 dark:border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-secondary-500/5 via-transparent to-transparent opacity-50 dark:from-brand-secondary-500/10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded border border-brand-secondary-500/30 bg-brand-secondary-100 px-4 py-1.5 text-[.8rem] font-medium uppercase tracking-wide text-brand-secondary-600 dark:border-brand-secondary-800/50 dark:bg-brand-secondary-900/30 dark:text-brand-secondary-400 mb-6"
          >
            <Network className="size-4" />
            The Ecosystem Advantage
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Why split vendors when you can have{" "} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-600 to-brand-secondary-500 dark:from-brand-primary-400 dark:to-brand-secondary-400">
              one unified system?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            Software engineered for the hardware we supply, maintained and secured by the team that built it. True synergy eliminates friction.
          </motion.p>
        </div>

        {/* Interconnected Flow */}
        <div className="relative mx-auto max-w-5xl mt-12 sm:mt-16 lg:mt-18">
          
          {/* DESKTOP EXACT TRIANGLE LAYOUT (Hidden on mobile) */}
          <div className="hidden lg:block relative mx-auto w-[800px] h-[550px]">
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 550">
              {/* Static Background Lines */}
              <line x1="400" y1="152" x2="150" y2="382" className="stroke-slate-200 dark:stroke-slate-700 transition-colors duration-500" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="400" y1="152" x2="650" y2="382" className="stroke-slate-200 dark:stroke-slate-700 transition-colors duration-500" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="150" y1="382" x2="650" y2="382" className="stroke-slate-200 dark:stroke-slate-700 transition-colors duration-500" strokeWidth="2" strokeDasharray="6 6" />

              {/* Animated Glowing Lines */}
              <line x1="400" y1="152" x2="150" y2="382" className="stroke-brand-secondary-500 dark:stroke-brand-secondary-400" strokeWidth="2" strokeDasharray="150 1000" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" values="1150;0" dur="4s" repeatCount="indefinite" />
              </line>
              <line x1="150" y1="382" x2="650" y2="382" className="stroke-brand-secondary-500 dark:stroke-brand-secondary-400" strokeWidth="2" strokeDasharray="150 1000" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" values="1150;0" dur="4s" repeatCount="indefinite" />
              </line>
              <line x1="650" y1="382" x2="400" y2="152" className="stroke-brand-secondary-500 dark:stroke-brand-secondary-400" strokeWidth="2" strokeDasharray="150 1000" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" values="1150;0" dur="4s" repeatCount="indefinite" />
              </line>
            </svg>

            {/* Top Center Node (Hardware) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, type: "spring", stiffness: 100 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] flex flex-col items-center text-center group z-10"
            >
              <div className="h-[120px] flex flex-col justify-end pb-2 w-full">
                <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">{nodes[0].title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{nodes[0].desc}</p>
              </div>
              <div className="relative flex shrink-0 h-16 w-16 items-center justify-center rounded-full bg-white shadow shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none dark:border dark:border-slate-700/50 transition-transform duration-500 group-hover:scale-110">
                <div className="absolute inset-0 rounded-full bg-brand-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {(() => { const Icon = nodes[0].icon; return <Icon className="h-8 w-8 text-brand-primary-500 dark:text-brand-primary-400 transition-colors group-hover:text-brand-secondary-500" /> })()}
              </div>
            </motion.div>

            {/* Bottom Left Node (Software) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="absolute top-[350px] left-[-10px] w-[320px] flex flex-col items-center text-center group z-10"
            >
              <div className="relative mb-3 flex shrink-0 h-16 w-16 items-center justify-center rounded-full bg-white shadow shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none dark:border dark:border-slate-700/50 transition-transform duration-500 group-hover:scale-110">
                <div className="absolute inset-0 rounded-full bg-brand-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {(() => { const Icon = nodes[1].icon; return <Icon className="h-8 w-8 text-brand-primary-500 dark:text-brand-primary-400 transition-colors group-hover:text-brand-secondary-500" /> })()}
              </div>
              <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">{nodes[1].title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{nodes[1].desc}</p>
            </motion.div>

            {/* Bottom Right Node (Managed IT) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="absolute top-[350px] right-[-10px] w-[320px] flex flex-col items-center text-center group z-10"
            >
              <div className="relative mb-3 flex shrink-0 h-16 w-16 items-center justify-center rounded-full bg-white shadow shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none dark:border dark:border-slate-700/50 transition-transform duration-500 group-hover:scale-110">
                <div className="absolute inset-0 rounded-full bg-brand-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {(() => { const Icon = nodes[2].icon; return <Icon className="h-8 w-8 text-brand-primary-500 dark:text-brand-primary-400 transition-colors group-hover:text-brand-secondary-500" /> })()}
              </div>
              <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">{nodes[2].title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{nodes[2].desc}</p>
            </motion.div>
          </div>

          {/* MOBILE LINEAR LAYOUT */}
          <div className="lg:hidden relative z-10">
            {/* Mobile Connection Line */}
            <div className="absolute left-[32px] sm:left-1/2 top-8 bottom-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-200 to-transparent dark:via-slate-800 z-0">
               <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 w-1.5 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary-500 shadow-[0_0_15px_rgba(56,189,248,0.8)] dark:bg-brand-secondary-400 blur-[1px]"
              />
            </div>
            
            <div className="flex flex-col gap-12 sm:gap-16 relative z-10">
              {nodes.map((node, index) => {
                const Icon = node.icon;
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                    className="flex flex-row sm:flex-col items-start sm:items-center sm:text-center group gap-6 sm:gap-0 mx-auto w-full"
                  >
                    <div className="relative mt-1 sm:mt-0 mb-0 sm:mb-6 flex shrink-0 h-16 w-16 items-center justify-center rounded-full bg-white shadow shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none dark:border dark:border-slate-700/50 transition-transform duration-500 group-hover:scale-110">
                      <div className="absolute inset-0 rounded-full bg-brand-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Icon className="h-8 w-8 text-brand-primary-500 dark:text-brand-primary-400 transition-colors group-hover:text-brand-secondary-500" />
                    </div>
                    <div>
                      <h3 className="mb-2 sm:mb-3 text-xl font-bold text-slate-900 dark:text-white">
                        {node.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 sm:max-w-[280px] leading-relaxed mx-auto text-sm sm:text-base">
                        {node.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingEcosystem;
