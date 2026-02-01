import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutTeam from "@/components/about/AboutTeam";
import LandingStats from "@/components/landing/LandingStats";
import AboutTestimonials from "@/components/about/AboutTestimonials";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/common/SEO";
import AboutStory from "@/components/about/AboutStory";

const About = () => {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Shero Technologies' mission to redefine possibilities through innovative tech solutions in Ghana and West Africa."
        url="/about-us"
      />
      <AboutHero />
      <AboutStory />
      <LandingStats />
      <AboutValues />
      <AboutTestimonials />
      <AboutTeam />
      <Footer />
    </>
  );
};

export default About;
