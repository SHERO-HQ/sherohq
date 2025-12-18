import { NavLink } from "react-router-dom";
import AnimatedText from "./motion/AnimatedText";
import * as motion from "motion/react-client";
import { fadeUp } from "../components/motion/heroMotion";
import { easeInOut } from "motion";
// import { useReducedMotion } from "motion/react";
import HeroVisual from "./motion/HeroVisual";

type HeaderText = {
  mainHeader: string;
  subHeader: string;
  btnLink?: () => void;
};

const makeHeaderText = (): HeaderText => ({
  mainHeader: "Redefining What's Possible",
  subHeader:
    "Solutions that empower people, businesses, and communities across technology, finance, innovation, and humanity",
  btnLink: () => {},
});

const headerData = makeHeaderText();
const HeroHeader = () => {
  // const prefersReducedMotion = useReducedMotion();

  return (
    <header className="min-h-[85vh] w-full bg-[url(/element.svg)] bg-contain bg-no-repeat bg-center lg:pt-52 md:pt-44 pt-32">
      <div className="container max-w-10/12 w-full mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-6">
        <div className="flex flex-col gap-6 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col gap-5"
          >
            <motion.h1
              variants={fadeUp}
              className="text-primary font-header font-extrabold lg:text-5xl md:text-5xl  sm:text-4xl text-3xl w-full space-y-3"
            >
              {headerData.mainHeader} <br />
              <span className="text-secondary inline-flex items-center gap-3 lg:text-7xl md:text-6xl text-5xl">
                <span>Across</span>
                <AnimatedText
                  words={[
                    "Technology.",
                    "Finance.",
                    "Education.",
                    "Innovation.",
                    "Humanity.",
                  ]}
                  interval={3000}
                />
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.1, ease: easeInOut }}
              className="md:max-w-8/12 w-full text-sm lg:text-lg"
            >
              {headerData.subHeader}
            </motion.p>
          </motion.div>
          <motion.div variants={fadeUp} className="explore flex items-center">
            <NavLink
              className="inline-flex items-center gap-2 text-gray-100 bg-secondary px-6 py-2 rounded hover:bg-secondary/90 scale-100 hover:scale-110 hover:shadow-lg hover:gap-3 active:translate-y-0 transition-all duration-500 ease-in-out"
              to="explore"
            >
              <span>Explore</span>
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </NavLink>
          </motion.div>
        </div>

        <motion.div>
          <div className="w-full hidden lg:flex items-center justify-center p-4">
   <HeroVisual />
</div>
        </motion.div>
      </div>
    </header>
  );
};

export default HeroHeader;
