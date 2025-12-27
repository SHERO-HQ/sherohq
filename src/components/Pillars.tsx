import * as motion from "motion/react-client";
// import { NavLink } from "react-router-dom";
import FadeInView from "./motion/AnimateSection";
import { fadeUp } from "./motion/heroMotion";
import PillarsVisual from "./motion/PillarsVisual";
import HeaderLineImage from "../assets/images/header-line.svg?react";

const ChooseUs = () => {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="relative w-full py-10 border-y-2 border-slate-300 dark:border-slate-700 dark:bg-slate-950"
    >
      <div className="container lg:max-w-9/12 max-w-11/12 w-full mx-auto flex lg:flex-row flex-col justify-between gap-5 items-center">
        <div className="relative mt-10 lg:mr-10 w-full lg:w-1/2">
          <FadeInView direction="right" delay={0.5}>
            <PillarsVisual />
          </FadeInView>
        </div>
        <div className="w-full mx-auto lg:w-1/2 mt-10 lg:mt-0">
          <FadeInView direction="up">
            <motion.header className="w-10/12 mx-auto relative" variants={fadeUp}>
              <h1 className="lg:text-7xl text-5xl dark:text-emerald-500 text-secondary font-header relative z-10">
                Our Pillars
              </h1>
                   <div className=" absolute lg:w-42 lg:left-30 lg:-mt-5 md:w-32 left-18 md:-mt-4 w-30 -mt-3">
                            {/* <img src="../../public/header-line.svg" alt="" /> */}
                            <HeaderLineImage className="w-full h-full text-primary" />
                          </div>
            </motion.header>
            <motion.div
              variants={fadeUp}
              className="text mt-10 w-full space-y-3"
            >
              <div className="technology max-w-10/12 w-full mx-auto flex items-start gap-5 dark:bg-slate-800 bg-slate-50 p-4 rounded shadow drop-shadow hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
                <div className="icon dark:bg-slate-900/80 bg-slate-100 shadow-md text-blue-400 inline-block rounded p-2">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-10"
                  >
                    <path
                      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text space-y-2">
                  <h3 className="font-logo font-bold text-3xl uppercase text-blue-400 select-none tracking-wider">
                    Technology
                  </h3>
                  <p className="select-none">
                    We design and build scalable software, SaaS platforms,
                    hardware and digital systems that solve real world problems
                    and power modern businesses.
                  </p>
                </div>
              </div>
              <div className="finance max-w-10/12 w-full mx-auto flex items-start gap-5 dark:bg-slate-800 bg-slate-50 p-4 rounded shadow drop-shadow hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
                <div className="icon dark:bg-slate-900/80 bg-slate-100 shadow-md text-blue-400 inline-block rounded p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-10"
                  >
                    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                    <path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" />
                  </svg>{" "}
                </div>
                <div className="text space-y-2">
                  <h3 className="font-logo font-bold text-3xl uppercase text-blue-400 tracking-wider select-none">
                    Finance
                  </h3>
                  <p className="select-none">
                    We design and build scalable software, SaaS platforms,
                    hardware and digital systems that solve real world problems
                    and power modern businesses.
                  </p>
                </div>
              </div>
              <div className="investment lg:max-w-10/12 max-w-11/12 w-full mx-auto flex items-start gap-5 dark:bg-slate-800 bg-slate-50 p-4 rounded shadow drop-shadow hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
                <div className="icon dark:bg-slate-900/80 bg-slate-100 shadow-md text-blue-400 inline-block rounded p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-10 lucide lucide-sprout-icon lucide-sprout"
                  >
                    <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
                    <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
                    <path d="M5 21h14" />
                  </svg>{" "}
                </div>
                <div className="text space-y-2">
                  <h3 className="font-logo font-bold text-3xl uppercase text-blue-400 select-none tracking-widerr">
                    Investment
                  </h3>
                  <p className="select-none">
                    We design and build scalable software, SaaS platforms,
                    hardware and digital systems that solve real world problems
                    and power modern businesses.
                  </p>
                </div>
              </div>
              <div className="education lg:max-w-10/12 max-w-11/12 w-full mx-auto flex items-start gap-5 dark:bg-slate-800 bg-slate-50 p-4 rounded shadow drop-shadow hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
                <div className="icon dark:bg-slate-900/80 bg-slate-100 shadow-md text-blue-400 inline-block rounded p-2">
                  <svg
                    className="size-10"
                    aria-hidden="true"
                    fill="none"
                    strokeWidth={2}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{" "}
                </div>
                <div className="text space-y-2">
                  <h3 className="font-logo font-bold text-3xl uppercase text-blue-400 tracking-wider select-none">
                    Education
                  </h3>
                  <p className="select-none">
                    We design and build scalable software, SaaS platforms,
                    hardware and digital systems that solve real world problems
                    and power modern businesses.
                  </p>
                </div>
              </div>
              <div className="humanity lg:max-w-10/12 w-full mx-auto flex items-start gap-5 dark:bg-slate-800 bg-slate-50 p-4 rounded shadow drop-shadow hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
                <div className="icon dark:bg-slate-900/80 bg-slate-100 shadow-md text-blue-400 inline-block rounded p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-10 lucide lucide-heart-handshake-icon lucide-heart-handshake"
                  >
                    <path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762" />
                  </svg>{" "}
                </div>
                <div className="text space-y-2">
                  <h3 className="font-logo font-bold text-3xl uppercase text-blue-400 tracking-wider select-none">
                    Humanity
                  </h3>
                  <p className="select-none">
                    We design and build scalable software, SaaS platforms,
                    hardware and digital systems that solve real world problems
                    and power modern businesses.
                  </p>
                </div>
              </div>
            </motion.div>
          </FadeInView>
        </div>
      </div>
    </motion.section>
  );
};

export default ChooseUs;
