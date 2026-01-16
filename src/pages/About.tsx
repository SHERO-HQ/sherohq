import AboutHero from "@/components/about/AboutHero";
import Values from "@/components/about/Values";
import Team from "@/components/about/Team";
import Stats from "@/components/Stats";
import Testimonials from "@/components/about/Testimonials";
import Footer from "@/components/Footer";
import { useTitle } from "@/hooks/useTitle";

const About = () => {
  useTitle("About Us");
  return (
    <>
      <AboutHero />
      <Stats />
      <Values />
      <Testimonials />
      <Team />
      <Footer />
    </>
  );
};

export default About;
