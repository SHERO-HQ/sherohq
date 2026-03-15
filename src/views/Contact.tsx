"use client";
import ContactForm from "@/components/common/ContactForm";
import { motion } from "motion/react";
import { Mail, MapPin, MessagesSquare, Phone } from "lucide-react";
import { COMPANY_EMAILS } from "@/constants/emails";

const Contact = () => {
 return (
 <>
 <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden dark:bg-slate-950 bg-slate-50 min-h-screen">
 {/* Dot Pattern Background */}
 <div className="absolute inset-0 pattern-dots opacity-30 dark:opacity-20 pointer-events-none" />

 {/* Deep Space Background - Dark Mode Only */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-0 dark:opacity-100 transition-opacity duration-500" />

 {/* Soft Light Mode Gradient */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-white dark:opacity-0 transition-opacity duration-500" />

 {/* Animated Orbs */}
 <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

 <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <div className="grid lg:grid-cols-2 gap-16 items-center">
 {/* Left Column: Info */}
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6 }}
 className="space-y-12"
 >
 <div>
 <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded border border-emerald-500/40 uppercase tracking-wider transition-colors duration-300">
 <span className="w-2 h-2 rounded-full bg-emerald-500" />
 Contact SHERO
 </span>
 <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
 Start{" "}
 <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
 Conversation
 </span>
 </h1>
 <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
 Tell us your goals and constraints. We will recommend the
 right mix of products, software, and support for your stage of
 growth.
 </p>

 <div className="flex flex-wrap gap-3 mt-7">
 <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
 24h Initial Response
 </span>
 <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
 Consultative Guidance
 </span>
 </div>
 </div>

 {/* Contact Details */}
 <div className="space-y-6">
 <ContactItem
 icon={
 <Mail className="w-5 h-5 text-teal-700 dark:text-emerald-400" />
 }
 label="Email Us"
 value={COMPANY_EMAILS.INFO}
 delay={0.2}
 />
 <ContactItem
 icon={
 <Phone className="w-5 h-5 text-blue-700 dark:text-blue-400" />
 }
 label="Call Us"
 value="+233 (54) 871-1582"
 delay={0.3}
 />
 <ContactItem
 icon={
 <MapPin className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
 }
 label="Visit Us"
 value="Tamale, Northern Region, Ghana"
 delay={0.4}
 />
 </div>
 </motion.div>

 {/* Right Column: Glass Form */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2 }}
 className="relative"
 >
 {/* Form Container */}
 <div className="relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded p-8 shadow-lg">
 <div className="absolute top-0 right-0 p-6 opacity-20">
 <MessagesSquare className="w-12 h-12" />
 </div>

 <div className="mb-8">
 <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-2">
 Send Message
 </h3>
 <p className="text-sm dark:text-slate-400 text-slate-900">
 We typically reply within 2hrs.
 </p>
 </div>

 <ContactForm />
 </div>

 {/* Decorative border glow */}
 <div className="absolute -inset-1 rounded bg-linear-to-br from-emerald-500/20 to-blue-500/20 blur-lg -z-10" />
 </motion.div>
 </div>
 </div>
 </div>
 </>
 );
};

const ContactItem = ({
 icon,
 label,
 value,
 delay,
}: {
 icon: React.ReactNode;
 label: string;
 value: string;
 delay: number;
}) => (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay, duration: 0.5 }}
 className="flex items-center gap-4 group"
 >
 <div className="w-12 h-12 rounded text-slate-900 dark:text-white bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
 {icon}
 </div>
 <div>
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
 {label}
 </p>
 <p className="dark:text-slate-200 text-slate-900/90 font-medium">
 {value}
 </p>
 </div>
 </motion.div>
);

export default Contact;
