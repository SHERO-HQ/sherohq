"use client";
import { m } from "motion/react";
import { ShieldCheck, Lock, Database, Activity, Shield } from "lucide-react";

const securityFeatures = [
  {
    id: 1,
    title: "End-to-End Encryption",
    desc: "Complete protection for your data, both in transit and at rest.",
    icon: Lock,
  },
  {
    id: 2,
    title: "Compliance Ready",
    desc: "Architecture built to support ISO 27001, SOC2, and HIPAA standards.",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Secure Supply Chain",
    desc: "Hardware sourced exclusively from verified, tamper-proof global channels.",
    icon: Database,
  },
  {
    id: 4,
    title: "24/7 Infrastructure Monitoring",
    desc: "Proactive systems management to identify and resolve issues before they impact your business.",
    icon: Activity,
  },
];

const LandingSecurity = () => {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 py-24 text-slate-200 border-b border-white/5">
      {/* Deep Dark Glowing Watermark Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center opacity-[0.03]">
        <Shield className="w-[120vw] h-[120vw] sm:w-[80vw] sm:h-[80vw] text-brand-primary-500" strokeWidth={0.5} />
      </div>
      
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-primary-500/10 opacity-20 blur-[100px]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-20">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded border border-brand-primary-500/30 bg-brand-primary-500/10 px-4 py-1.5 text-[.8rem] font-medium uppercase tracking-wide text-brand-primary-400 mb-6"
          >
            <ShieldCheck className="size-4" />
            Enterprise-Grade Security
          </m.div>
          
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Secure By{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-400 to-white">
              Design.
            </span>
          </m.h2>
          
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            We don't just bolt on security as an afterthought. It is woven into the very fabric of our hardware and custom software ecosystem.
          </m.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <m.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="group relative rounded border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] hover:border-brand-primary-500/30 overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="relative z-10 flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-primary-500/10 border border-brand-primary-500/20 text-brand-primary-400 group-hover:bg-brand-primary-500 group-hover:text-slate-950 transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingSecurity;
