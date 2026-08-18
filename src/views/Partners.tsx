"use client";
import { m } from "motion/react";
import {
  Handshake,
  Building2,
  CheckCircle2,
  ArrowRight,
  Globe2,
  GraduationCap,
  Landmark,
  HeartPulse,
  Sprout,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { useRouter } from "next/navigation";

const Partners = () => {
  const router = useRouter();

  const handleApplyClick = () => {
    // Navigate to contact page with partnership inquiry pre-selected
    router.push("/contact-us?inquiry=partnership");
  };

  const partners: Array<{ name: string; icon: LucideIcon }> = [
    { name: "Tech Companies", icon: Building2 },
    { name: "Regional Systems", icon: Globe2 },
    { name: "EduTech Solutions", icon: GraduationCap },
    { name: "FinTechs", icon: Landmark },
    { name: "Health Industries", icon: HeartPulse },
    { name: "AgriTech", icon: Sprout },
  ];

  const steps = [
    {
      title: "Application",
      desc: "Submit your partnership interest form with core business details.",
    },
    {
      title: "Validation",
      desc: "Our executive team reviews local alignment and technical capacity.",
    },
    {
      title: "Onboarding",
      desc: "Gain full access to the SHERO portal and tiered wholesale pricing.",
    },
  ];

  const benefits = [
    "Access to enterprise-grade commercial hardware at wholesale rates",
    "Priority technical support and dedicated account management",
    "Co-marketing opportunities and brand visibility",
    "Early access to new product launches and innovations",
  ];

  return (
    <>
      <div className="pt-8 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div
            className="text-center max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
          >
            <SectionBadge icon={Handshake} className="mb-4">
              Strategic Partnerships
            </SectionBadge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 tracking-tight transition-colors duration-300">
              Grow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600 dark:from-brand-primary-500 dark:to-brand-secondary-500">SHERO</span>
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Collaborate on technology projects, unlock distribution
              opportunities, and deliver measurable value across markets.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
                Wholesale Access
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
                Dedicated Team
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
                Co-Marketing Support
              </span>
            </div>
          </div>

          {/* Partnership Process */}
          <section className="mb-16 py-10 border-y border-slate-200 dark:border-slate-800/50">
            <div className="text-center mb-10">
              <SectionBadge icon={Workflow} className="mb-4">
                The Path to Partnership
              </SectionBadge>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors duration-300">
                We Grow Together
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto px-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="size-10 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center font-mono font-bold text-brand-secondary-700 dark:text-brand-secondary-400">
                      0{idx + 1}
                    </div>
                    {idx < 3 && (
                      <div className="hidden md:block h-px flex-1 bg-linear-to-r from-slate-200 to-transparent dark:from-slate-800" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Ecosystem Grid */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <SectionBadge icon={Globe2} className="mb-4">
                Strategic Ecosystem
              </SectionBadge>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">
                Expanding Reach
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                We empower industries that require high-availability business
                infrastructure and specialized technical support.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-slate-200 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 overflow-hidden rounded">
              {partners.map((partner, idx) => (
                <m.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center gap-4 hover:bg-white dark:hover:bg-slate-900 transition-colors group cursor-default"
                >
                  <div className="flex items-center justify-center group-hover:scale-110 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors">
                    <partner.icon className="w-8 h-8 text-slate-500 dark:text-slate-400 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-center">
                    {partner.name}
                  </span>
                </m.div>
              ))}
            </div>
          </section>

          {/* Become a Partner CTA */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow">
            <div className="absolute inset-0 bg-linear-to-bl from-brand-secondary-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:gap-12">
              <div className="md:flex-1">
                <SectionBadge icon={Handshake} className="mb-6">
                  Tiered Benefits
                </SectionBadge>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 transition-colors duration-300">
                  Become a Solution Partner
                </h2>
                <ul className="space-y-4 mb-8 text-sm">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-secondary-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleApplyClick}
                  className="group cursor-pointer inline-flex items-center gap-2 px-8 py-2.5 bg-brand-secondary-700 hover:bg-brand-secondary-800 dark:bg-brand-secondary-600 dark:hover:bg-brand-secondary-500 text-white text-sm rounded font-semibold transition duration-300 shadow shadow-brand-secondary-500/25 hover:shadow hover:shadow-brand-secondary-500/30 hover:scale-[1.02] active:scale-95"
                >
                  <span>Start Partnership</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="hidden md:block w-px self-stretch bg-slate-200 dark:bg-slate-800/80" />

              <div className="relative z-10 hidden md:flex md:flex-1 justify-center">
                <div className="w-64 h-64 bg-brand-secondary-100/50 dark:bg-brand-secondary-900/50 rounded-full flex items-center justify-center relative border border-brand-secondary-200/50 dark:border-brand-secondary-800/50 shadow-inner">
                  <svg
                    className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] text-brand-secondary-500/15"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="6 4"
                      fill="transparent"
                    />
                  </svg>
                  <Handshake className="w-24 h-24 text-brand-secondary-600/90 dark:text-brand-secondary-400/90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partners;
