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

const Values = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative">
      <div className="container px-4 md:px-6 mx-auto w-full md:max-w-10/12">
        <div className="text-center mb-16">
           <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">            
           <Lightbulb className="w-5" />
          Core Values
          </span>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-6">
            Our Core Values
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
            The principles that guide every line of code we write and every
            decision we make.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group p-8 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded flex items-center justify-center mb-6 transition-colors duration-300",
                  item.color === "emerald" &&
                    "bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white",
                  item.color === "blue" &&
                    "bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white",
                  item.color === "violet" &&
                    "bg-violet-100/50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white",
                  item.color === "amber" &&
                    "bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                )}
              >
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-sora text-slate-900 dark:text-slate-100 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
