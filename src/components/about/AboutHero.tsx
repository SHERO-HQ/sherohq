import { motion } from "motion/react";
import { Code2, Users, Zap, Smartphone, Laptop, TruckElectric } from "lucide-react";
import type { ElementType } from "react";

const AboutHero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]" />
      <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />

      <div className="container px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-8 inline-block shadow-sm">
            Empowering the Future since 2021
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-sora tracking-tight text-slate-900 dark:text-slate-100 mb-6">
            Premium Products & <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
              Full-Spectrum IT
            </span>
          </h1>
          <p className="max-w-[800px] mx-auto text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            We are a collective of visionary developers and strategists
            dedicated to delivering innovative software products and
            comprehensive IT services that transform businesses.
          </p>
        </motion.div>

        {/* Decorative Icons Floating */}
        <FloatingIcon
          icon={Code2}
          className="top-20 left-[10%] text-emerald-500 rotate-12"
          delay={0}
        />
        <FloatingIcon
          icon={Users}
          className="bottom-40 right-[10%] text-blue-500 -rotate-12"
          delay={0.2}
        />
        <FloatingIcon
          icon={Zap}
          className="top-32 right-[15%] text-amber-500 rotate-6"
          delay={0.4}
        />
         <FloatingIcon
          icon={TruckElectric}
          className="top-50 right-[12%] text-emerald-500 rotate-6"
          delay={0.6}
        />
        <FloatingIcon
          icon={Laptop}
          className="bottom-32 left-[15%] text-violet-500 -rotate-6"
          delay={0.8}
        />
        <FloatingIcon
          icon={Smartphone}
          className="top-1/2 left-[5%] text-slate-500 rotate-45 hidden xl:flex"
          delay={1}
        />
      </div>
    </section>
  );
};

const FloatingIcon = ({
  icon: Icon,
  className,
  delay,
}: {
  icon: ElementType;
  className?: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 20 }}
    animate={{
      opacity: 1,
      scale: 1,
      y: [0, -15, 0],
    }}
    transition={{
      opacity: { duration: 0.5, delay },
      scale: { duration: 0.5, delay },
      y: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay + 0.5,
      },
    }}
    className={`absolute hidden lg:flex p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 ${className}`}
  >
    <Icon className="w-6 h-6" />
  </motion.div>
);

export default AboutHero;
