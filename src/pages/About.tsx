import Development from "@/components/Development";
import Footer from "@/components/Footer";
import { useTitle } from "@/hooks/useTitle";

const About = () => {
  useTitle("About Us");
  return (
    <>
      <Development />
      <Footer />
    </>
  );
};

export default About;
