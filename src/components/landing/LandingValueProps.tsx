"use client";
import { StaggerContainer, StaggerItem } from "@/components/motion/AnimateSection";
import { Truck, ShieldCheck, Headset, CreditCard, Verified } from "lucide-react";

const values = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders over GH₵500",
  },
  {
    icon: Verified,
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
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
          staggerDelay={0.08}
          threshold={0.1}
        >
          {values.map((item, index) => {
            const borderClass = [
              "border-b sm:border-r sm:border-b lg:border-b-0 lg:border-r", // Item 0
              "border-b sm:border-b lg:border-b-0 lg:border-r",             // Item 1
              "border-b sm:border-r lg:border-b-0 lg:border-r",             // Item 2
              "border-b-0"                                                   // Item 3
            ][index];

            return (
              <StaggerItem key={item.title} yOffset={15} scale={1} duration={0.4}>
                <div className={`flex items-center gap-4 group py-4 lg:py-2 lg:px-6 border-slate-200 dark:border-slate-800/40 ${borderClass}`}>
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center text-brand-secondary-600 dark:text-brand-secondary-400 transition duration-300">
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
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default LandingValueProps;
