import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutTeam from "@/components/about/AboutTeam";
import LandingStats from "@/components/landing/LandingStats";
import AboutTestimonials from "@/components/about/AboutTestimonials";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";
// import AboutTimeline from "@/components/about/AboutTimeline";
import AboutStory from "@/components/about/AboutStory";

const About = () => {
  useTitle("About Us");
  return (
    <>
      <AboutHero />
      <AboutStory />
      <LandingStats />
      {/* <AboutTimeline /> */}
      <AboutValues />
      <AboutTestimonials />
      <AboutTeam />
      <Footer />
    </>
  );
};

export default About;
