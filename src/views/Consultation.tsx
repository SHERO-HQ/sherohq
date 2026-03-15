"use client";
import ConsultationHero from "@/components/solutions/ConsultationHero";
import Scheduler from "@/components/solutions/Scheduler";

const Consultation = () => {
 return (
 <>
 <ConsultationHero />

 <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950 -mt-20 relative z-20">
 <div className="container max-w-7xl mx-auto">
 <Scheduler />
 </div>
 </section>
 </>
 );
};

export default Consultation;
