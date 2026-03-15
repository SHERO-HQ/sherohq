"use client";
import Link from "next/link";
import { ArrowRight, WandSparkles } from "lucide-react";
import { RocketIcon } from "@/assets/icons/icons";

const LandingFinalCTA = () => {
  return (
    <section className="relative w-full py-16 lg:py-16 overflow-hidden dark:bg-slate-950">
      {/* Container */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Massive Glass Card */}
        <div
          className="relative overflow-hidden rounded bg-slate-900 border border-white/10"
          suppressHydrationWarning
        >
          {/* Lightweight layered background gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-slate-900/50" />

          <div className="relative z-10 p-8 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between">
            {/* Content Left */}
            <div className="max-w-xl space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white/5 border border-emerald-400/50 backdrop-blur-sm">
                <WandSparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-100 uppercase">
                  Build Faster With SHERO
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-tight">
                Ready to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
                  Launch?
                </span>
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Go from idea to launch with product engineering, cloud, and
                growth systems built for measurable business outcomes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/contact-us"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-1 transition duration-300"
                >
                  Book a Strategy Call
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/solutions"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-2 rounded bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition duration-300"
                >
                  View Solutions
                </Link>
              </div>
            </div>

            {/* Visual Right (Rocket/Abstract) */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center rounded-full">
                {/* Brighter inner glow */}
                <div className="absolute inset-8 bg-emerald-400/15 rounded-full blur-2xl" />

                {/* Glass circle container */}
                <div className="relative z-10 flex items-center justify-center">
                  <RocketIcon className="w-40 h-40 text-emerald-400 drop-shadow-lg" />
                </div>

                {/* Static Orbiting Circles */}
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div className="absolute inset-[15%] rounded-full border border-white/10" />
                <div className="absolute inset-[30%] rounded-full border border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFinalCTA;
