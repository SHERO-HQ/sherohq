"use client";
// import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutTeam from "@/components/about/AboutTeam";
import LandingStats from "@/components/landing/LandingStats";
import AboutTestimonials from "@/components/about/AboutTestimonials";
import AboutStory from "@/components/about/AboutStory";

const About = () => {
 return (
 <>
 {/* <AboutHero /> */}
 <AboutStory />
 <LandingStats />
 <AboutValues />
 <AboutTestimonials />
 <AboutTeam />
 </>
 );
};

export default About;
