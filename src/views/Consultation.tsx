"use client";
import ConsultationHero from "@/components/solutions/ConsultationHero";
import Scheduler from "@/components/solutions/Scheduler";
import { Cpu, Target, Zap } from "lucide-react";

const Consultation = () => {
 return (
  <>
   <ConsultationHero />

   {/* Trust/Process Section */}
   <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 -mt-20 relative z-30 overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary-500/5 rounded-full blur-3xl" />
    <div className="container max-w-7xl mx-auto px-4">
     <div className="max-w-3xl mb-16 px-1">
      <h2 className="text-sm font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest mb-2">The Framework</h2>
      <h3 className="text-3xl font-bold dark:text-white text-slate-900 mb-6">Aligning Infrastructure with Ambition</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed ">
       Our 30-minute discovery sessions are designed to isolate technical bottlenecks and map out a localized deployment strategy.
      </p>
     </div>

     <div className="grid md:grid-cols-3 gap-8">
      {expertTopics.map((topic, idx) => (
       <div key={idx} className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded group hover:border-brand-secondary-500/30 transition-all duration-300 shadow-sm hover:shadow">
        <div className="size-12 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
         <topic.icon className="size-6 text-brand-secondary-600 dark:text-brand-secondary-400" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{topic.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
         {topic.desc}
        </p>
       </div>
      ))}
     </div>
    </div>
   </section>

   <section className="py-16 px-4 bg-slate-50 dark:bg-slate-950 relative z-20">
    <div className="container max-w-7xl mx-auto">
     <div className="text-center mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900">Schedule A Session</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Select a time that works for your stakeholders.</p>
     </div>
     <Scheduler />
    </div>
   </section>
  </>
 );
};

const expertTopics = [
 {
  title: "Procurement Strategy",
  desc: "Optimizing supply chains for enterprise hardware and specialized technical equipment sourcing.",
  icon: Target
 },
 {
  title: "System Architecture",
  desc: "Designing resilient software and hardware stacks for high-growth, high-availability environments.",
  icon: Cpu
 },
 {
  title: "Logistics Planning",
  desc: "Structuring efficient delivery and deployment protocols across complex regional territories.",
  icon: Zap
 }
];

export default Consultation;
