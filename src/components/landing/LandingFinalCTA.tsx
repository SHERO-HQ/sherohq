"use client";
import NavLink from "@/components/common/NavLink";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { ArrowRight, WandSparkles } from "lucide-react";
import { RocketIcon } from "@/assets/icons/icons";

const LandingFinalCTA = () => {
 return (
 <section className="relative w-full py-16 overflow-hidden dark:bg-slate-950">
 {/* Container */}
 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 {/* Massive Glass Card */}
 <div 
 className="relative overflow-hidden rounded bg-slate-900 border border-white/10"
 suppressHydrationWarning
 >
 {/* Static Background Image */}
 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
 <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-slate-900/50" />

 <div className="relative z-10 p-8 md:p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between">
 {/* Content Left */}
 <div className="max-w-xl space-y-4 text-center md:text-left">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white/5 border border-emerald-400/50 backdrop-blur-sm">
 <WandSparkles className="w-4 h-4 text-emerald-400" />
 <span className="text-xs font-medium text-emerald-100 uppercase">
 Build Faster With SHERO
 </span>
 </div>

 <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
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
 <NavLink
 href={getAbsoluteUrl("/contact-us")}
 className="group inline-flex items-center justify-center gap-2 px-8 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 transition duration-300"
 >
 Let's Talk
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </NavLink>
 <NavLink
 href={getAbsoluteUrl("/solutions")}
 className="group inline-flex items-center justify-center gap-2 px-8 py-2 rounded bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition duration-300"
 >
 View Solutions
 </NavLink>
 </div>
 </div>

 {/* Visual Right (Rocket/Abstract) */}
 <div className="relative flex items-center justify-center">
 <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center rounded-full">


 {/* Brighter inner glow */}
 <div className="absolute inset-8 bg-amber-400/5 rounded-full blur-2xl" />

 {/* Glass circle container */}
 <div className="relative z-10 flex items-center justify-center">
 <RocketIcon className="w-40 h-40 text-emerald-400 drop-shadow-lg" />
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
