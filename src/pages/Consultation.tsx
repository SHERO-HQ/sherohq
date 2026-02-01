import ConsultationHero from "@/components/solutions/ConsultationHero";
import Scheduler from "@/components/solutions/Scheduler";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/common/Seo";

const Consultation = () => {
  return (
    <>
      <Seo
        title="Consultation"
        description="Book a tech consultation with SHERO Technologies to discuss your infrastructure and software needs."
        url="/consultation"
      />
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
