"use client";
import { motion } from "motion/react";
import { Truck, ShieldCheck, Headset, CreditCard } from "lucide-react";

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
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y divide-slate-200 dark:divide-slate-800 lg:divide-y-0 lg:divide-x">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="flex items-center gap-4 group py-4 lg:py-2 lg:px-6 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="shrink-0 w-12 h-12 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition duration-300">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
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
