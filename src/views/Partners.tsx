"use client";
import { motion } from "motion/react";
import { Handshake, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Partners = () => {
 const router = useRouter();

 const handleApplyClick = () => {
 // Navigate to contact page with partnership inquiry pre-selected
 router.push("/contact-us?inquiry=partnership");
 };

 const partners = [
 { name: "Tech Companies", logo: "🏢" },
 { name: "Global Systems", logo: "🌐" },
 { name: "EduTech Solutions", logo: "🎓" },
 { name: "FinTechs", logo: "💰" },
 { name: "Health Industries", logo: "🏥" },
 { name: "AgriTech", logo: "🌱" },
 ];

 const benefits = [
 "Access to premium enterprise hardware at wholesale rates",
 "Priority technical support and dedicated account management",
 "Co-marketing opportunities and brand visibility",
 "Early access to new product launches and innovations",
 ];

 return (
 <>
 <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Hero Section */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center max-w-3xl mx-auto mb-20"
 >
 <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded border border-emerald-500/20 uppercase tracking-wider">
 <Handshake className="w-4 h-4" />
 <span className="text-emerald-600 dark:text-emerald-400">
 Strategic Partnerships
 </span>
 </div>
 <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
 Grow with{" "}
 <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-blue-600 dark:to-blue-400">
SHERO
 </span>
 </h1>
 <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
 Collaborate on enterprise projects, unlock distribution
 opportunities, and deliver measurable value across markets.
 </p>

 <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
 <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
 Wholesale Access
 </span>
 <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
 Dedicated Account Team
 </span>
 <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
 Co-Marketing Support
 </span>
 </div>
 </motion.div>

 {/* Current Partners Grid */}
 <section className="mb-24">
 <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-12">
 Trusted by Industry Leaders
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
 {partners.map((partner, idx) => (
 <motion.div
 key={idx}
 initial={{ opacity: 0, scale: 0.9 }}
 whileInView={{ opacity: 1, scale: 1 }}
 transition={{ delay: idx * 0.1 }}
 viewport={{ once: true }}
 className="bg-white dark:bg-slate-900 p-8 rounded border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/30 hover:shadow-lg transition group"
 >
 <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
 {partner.logo}
 </span>
 <span className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
 {partner.name}
 </span>
 </motion.div>
 ))}
 </div>
 </section>

 {/* Become a Partner CTA */}
 <div className="grid md:grid-cols-2 gap-12 items-center bg-white dark:bg-slate-900 rounded p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden relative">
 <div className="relative z-10">
 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
 Become a Solution Partner
 </h2>
 <ul className="space-y-4 mb-8">
 {benefits.map((benefit, idx) => (
 <li key={idx} className="flex items-start gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
 <span className="text-slate-600 dark:text-slate-400">
 {benefit}
 </span>
 </li>
 ))}
 </ul>
 <button
 onClick={handleApplyClick}
 className="group cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-md hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
 >
 <span>Apply Now</span>
 <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
 </button>
 </div>

 <div className="relative z-10 flex justify-center">
 <div className="w-64 h-64 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center relative">
 <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full animate-spin-slow" />
 <Building2 className="w-32 h-32 text-emerald-600 dark:text-emerald-400" />
 </div>
 </div>

 {/* Background Decoration */}
 <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-emerald-500/5 to-transparent pointer-events-none" />
 </div>
 </div>
 </div>
 </>
 );
};

export default Partners;
