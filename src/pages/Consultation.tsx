import ConsultationHero from "@/components/solutions/ConsultationHero";
import Scheduler from "@/components/solutions/Scheduler";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";

const Consultation = () => {
  useTitle("Consultation");

  return (
    <>
      <ConsultationHero />

      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950 -mt-20 relative z-20">
        <div className="container max-w-7xl mx-auto">
          <Scheduler />
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Consultation;
