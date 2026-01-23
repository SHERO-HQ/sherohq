import { motion } from "motion/react";
import { Search, Lightbulb, Code2, Rocket, Workflow } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Discovery",
    description:
      "We dive deep into your business goals, challenges, and requirements to understand your vision clearly.",
    icon: <Search className="w-6 h-6" />,
  },
  {
    title: "Strategy",
    description:
      "Our experts craft a tailored roadmap and architecture designed for scalability and performance.",
    icon: <Lightbulb className="w-6 h-6" />,
  },
  {
    title: "Development",
    description:
      "We build your solution using cutting-edge technologies with a focus on code quality and security.",
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    title: "Launch",
    description:
      "Rigorous testing ensures a flawless deployment, followed by ongoing support and optimization.",
    icon: <Rocket className="w-6 h-6" />,
  },
];

const Process = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-500 uppercase tracking-wider">
            <Workflow className="w-4 h-4" />
            <span>How We Work</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-slate-100 mt-2 mb-4">
            Our Process
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A transparent, agile workflow designed to deliver exceptional
            results on time and within budget.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[2.5rem] left-0 w-full h-0.5 bg-linear-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

          {/* Connector Line (Mobile/Tablet) - Vertical */}
          <div className="absolute lg:hidden top-0 left-8 h-full w-0.5 bg-linear-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center gap-6 lg:gap-0 group"
              >
                {/* Step Number Badge */}
                <div
                  className="w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none
                           flex items-center justify-center lg:mb-6 relative z-10
                           border-2 border-transparent group-hover:border-emerald-500/50 transition-colors duration-300"
                >
                  <div className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  {/* Absolute number for style */}
                  <span className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-emerald-600 text-white text-xs lg:text-sm font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-900">
                    {index + 1}
                  </span>
                </div>

                <div className="pt-2 lg:pt-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 lg:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
