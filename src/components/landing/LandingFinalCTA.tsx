import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { ArrowRight, WandSparkles } from "lucide-react";
import { RocketIcon } from "@/assets/icons/icons";

const LandingFinalCTA = () => {
  return (
    <section className="relative w-full py-24 lg:py-22 overflow-hidden dark:bg-slate-950">
      {/* Container */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Massive Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded bg-slate-900 border border-white/10"
        >
          {/* Warp Speed Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 hover:scale-105 transition-transform duration-[2s]" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-slate-900/50" />

          <div className="relative z-10 p-8 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between">
            {/* Content Left */}
            <div className="max-w-xl space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white/5 border border-emerald-400/50 backdrop-blur-sm">
                <WandSparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-100 uppercase">
                  Unlock Your Potential
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-tight">
                Ready to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
                  Launch?
                </span>
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Join the league of visionaries who are redefining their
                industries with SHERO's cutting-edge ecosystem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <NavLink
                  to="/contact-us"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-1 transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </NavLink>
                <NavLink
                  to="/solutions"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-2 rounded bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  View Solutions
                </NavLink>
              </div>
            </div>

            {/* Visual Right (Rocket/Abstract) */}
            <div className="relative">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                {/* Glowing Core */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl"
                />

                {/* Glass Circle Container */}
                <div className="relative z-10 w-full h-full backdrop-blur-md flex items-center justify-center">
                  <motion.div
                    animate={{
                      y: [-20, 20, -20],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={{
                      scale: 1.1,
                      y: -20,
                      transition: { duration: 0.3 },
                    }}
                    className="relative"
                  >
                    <RocketIcon className="w-32 h-32 text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]" />
                    {/* Engine Flame */}
                    <motion.div
                      animate={{ height: [0, 20, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4 bg-orange-500 blur-sm rounded-full"
                    />
                  </motion.div>
                </div>

                {/* Orbiting Particles */}
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-[15%] rounded-full border border-white/5 animate-[spin_7s_linear_infinite_reverse]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingFinalCTA;
