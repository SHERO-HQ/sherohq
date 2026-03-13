"use client";
import { motion } from "motion/react";
import {
  Truck,
  ShieldCheck,
  Headset,
  CreditCard,
} from "lucide-react";

const values = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders over GH₵500",
  },
  {
    icon: ShieldCheck,
    title: "Verified Products",
    description: "Authentic hardware guaranteed",
  },
  {
    icon: Headset,
    title: "Expert Support",
    description: "Free tech consultation",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "MoMo, Card, Cash on Delivery",
  },
];

const LandingValueProps = () => {
  return (
    <section className="relative w-full py-8 lg:py-10 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="flex items-center gap-4 group"
            >
              <div className="shrink-0 w-12 h-12 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-sora text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingValueProps;
