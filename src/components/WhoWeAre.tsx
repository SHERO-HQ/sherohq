import { NavLink } from "react-router-dom";
import { motion, easeInOut } from "motion/react";

const WhoWeAre = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeInOut },
    },
  };

  return (
    <section className="relative w-full pb-20 overflow-hidden">
      {/* Background Blob */}
      <img
        src="/blob.svg"
        alt=""
        className="opacity-10 absolute -left-20 top-20 rotate-12 w-80 pointer-events-none"
      />

      <div className="container lg:max-w-10/12 max-w-11/12 mx-auto flex flex-col-reverse lg:flex-row gap-10 items-center pt-10">
        {/* TEXT CONTENT (Staggered) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full lg:w-1/2"
        >
          <motion.header variants={itemVariants} className="relative">
            <h2 className="lg:text-6xl md:text-5xl text-4xl text-primary font-mono font-bold relative z-10">
              Who We Are
            </h2>
            <div className=" absolute lg:w-54 lg:left-40 lg:-mt-4 md:w-46 left-32 md:-mt-3 w-40 -mt-3"></div>
          </motion.header>

          <motion.div variants={itemVariants} className="text mt-5">
            <p className="lg:text-lg leading-relaxed text-slate-600 dark:text-slate-400 text-balance">
              <span className="dark:text-blue-500 text-primary font-bold font-mono">
                SHERO
              </span>{" "}
              builds solutions across software, fin-tech, hardware, and
              humanitarian impact. We empower individuals, businesses, and
              communities to{" "}
              <span className="text-secondary dark:text-emerald-500 font-extrabold font-mono">
                Redefine Possible
              </span>
              .
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <NavLink
              className="inline-flex items-center justify-center gap-2 text-white bg-secondary px-8 py-2 rounded hover:bg-secondary/90 transition-all duration-300 shadow-lg shadow-secondary/20"
              to="explore"
            >
              Explore Impact
            </NavLink>
          </motion.div>
        </motion.div>

        {/* IMAGE CONTENT */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative w-full lg:w-1/2 flex justify-center"
        >
          <img
            src={String(WhoWeAreImage)}
            alt="Who We Are"
            className="cover lg:rotate-6 shadow-2xl h-92 lg:h-112.5 w-full max-w-md"
          />
        </motion.div> */}
      </div>
    </section>
  );
};

export default WhoWeAre;
