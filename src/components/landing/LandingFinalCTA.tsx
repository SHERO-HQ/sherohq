"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, LucideSquareStack, WandSparkles } from "lucide-react";
import { RocketIcon } from "@/assets/icons/icons";

const LandingFinalCTA = () => {
  return (
    <section className="relative w-full py-8 lg:py-8 overflow-hidden dark:bg-slate-950">
      {/* Container */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Massive Glass Card */}
        <div
          className="relative overflow-hidden rounded bg-slate-900 border border-white/10 min-h-100 flex items-center"
          suppressHydrationWarning
        >
          {/* Warp Speed Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
              alt="Space Technology Background"
              fill
              className="object-cover opacity-60 hover:scale-105 transition-transform duration-[4s]"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/60 to-slate-900/30" />
          </div>

          {/* Subtle Glows */}
          {/* Removed subtle glow for performance */}

          <div className="relative z-20 md:p-16 p-8 flex flex-col lg:flex-row items-center justify-between w-full">
            {/* Content Left */}
            <div className="max-w-xl space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded bg-brand-secondary-600/12 border border-brand-secondary-500/50 transition-colors duration-300 mb-2">
                <WandSparkles className="size-4 text-brand-secondary-300" />
                <span className="text-[10px] font-semibold text-brand-secondary-300 uppercase">
                  Let's Make Magic Happen
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-5xl font-sora font-bold tracking-tight text-white leading-tight">
                Ready to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-500 to-brand-secondary-400">
                  Launch?
                </span>
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Go from idea to launch with product engineering, cloud, and
                growth systems built for measurable business outcomes.
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-10">
                <Link
                  href="/contact-us"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-2 rounded w-fit bg-brand-secondary-600 text-white text-sm font-medium hover:bg-brand-secondary-500 transition duration-300"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              
              </div>
            </div>

            {/* Visual Right (Rocket/Abstract) */}
            <div className="relative md:flex items-center justify-center hidden">
              <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center rounded-full">
                {/* Brighter inner glow */}
                {/* Removed inner glow for performance */}

                {/* Glass circle container */}
                <div className="relative z-10 flex items-center justify-center">
                  <RocketIcon className="w-40 h-40 text-brand-secondary-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFinalCTA;
