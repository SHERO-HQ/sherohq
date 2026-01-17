import { NavLink } from "react-router-dom";
import { motion, easeInOut } from "motion/react";
import { Handshake, Info, Laptop, MessageSquareMore, ShoppingBag } from "lucide-react";

const WhoWeAre = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeInOut },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95, x: 50 },
    show: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.8, ease: easeInOut },
    },
  };

  // Stats data
  const stats = [
    { value: "1500+", label: "Projects Delivered" },
    { value: "3+", label: "Partners" },
    { value: "4+", label: "Years Experience" },
  ];

  return (
    <section className="relative w-full py-20 lg:py-28 overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 via-transparent to-blue-50/50 dark:from-emerald-950/20 dark:via-transparent dark:to-blue-950/20 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* TEXT CONTENT */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full lg:w-1/2 space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Info className="size-5" />
                About Us
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-slate-900 dark:text-slate-100">
                Who We Are
              </h2>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="space-y-4">
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  SHERO
                </span>{" "}
                is a technology company building cutting-edge solutions that
                empower individuals, businesses, and communities. From premium
                tech accessories to custom software development, we deliver
                innovation that drives growth.
              </p>

              <p className="text-base text-slate-600 dark:text-slate-400">
                We specialize in four core areas: retail tech products,
                strategic consultation, partnership programs, and comprehensive
                software & IT solutions. Our mission is to help you{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Redefine Possible
                </span>{" "}
                through technology.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 py-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <NavLink
                className="inline-flex items-center justify-center gap-3 
                         text-white bg-emerald-600 dark:bg-emerald-500
                         px-8 py-3 rounded font-semibold
                         hover:bg-emerald-700 dark:hover:bg-emerald-600
                         hover:shadow-xl hover:shadow-emerald-500/25
                         hover:-translate-y-0.5
                         transition-all duration-300
                         group"
                to="/explore"
              >
                Explore Impact
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </NavLink>
            </motion.div>
          </motion.div>

          {/* IMAGE/VISUAL CONTENT */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full lg:w-1/2"
          >
            {/* Option 1: Decorative Card Grid */}
            <div className="relative grid md:grid-cols-2 gap-4 lg:gap-6 mt-5 md:mt-auto">
              {/* Card 1 - Shop Products */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative flex flex-col justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded p-6 text-white shadow-xl"
              >
                <div className="text-7xl -top-9 absolute bg-blue-500 p-2 rounded shadow">
                  <ShoppingBag className="w-16 h-16" />
                </div>
                <h3 className="font-bold font-sora text-lg mb-2 mt-4">Shop Products</h3>
                <p className="text-sm opacity-90">Premium tech accessories</p>
              </motion.div>

              {/* Card 2 - Consultation */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative bg-linear-to-br from-emerald-500 to-emerald-600 rounded p-6 text-white shadow-xl mt-8"
              >
                <div className="-top-9 absolute bg-emerald-500 p-2 rounded shadow">
                  <MessageSquareMore className="w-16 h-16" />
                </div>
                <h3 className="font-bold text-lg mb-2 mt-8">Consultation</h3>
                <p className="text-sm opacity-90">Expert tech advisory</p>
              </motion.div>

              {/* Card 3 - Partnerships */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative bg-linear-to-br from-purple-500 to-purple-600 rounded py-8 px-6 text-white shadow-xl mt-8"
              >
                <div className="text-7xl -top-9 absolute bg-purple-500 p-2 rounded shadow">
                  <Handshake className="w-16 h-16"/>
                </div>
                <h3 className="font-bold font-sora text-lg mb-2 mt-4">Partnerships</h3>
                <p className="text-sm opacity-90">Strategic collaborations</p>
              </motion.div>

              {/* Card 4 - Software & IT */}
              <motion.div
                whileHover={{ y: -8 }}
                className="relative bg-linear-to-br from-indigo-500 to-indigo-600 rounded px-6 py-4 text-white shadow-xl md:mt-14 mt-8"
              >
                <div className="text-7xl -top-9 absolute bg-indigo-500 p-2 rounded shadow">
                  <Laptop className="w-16 h-16" />
                </div>
                <h3 className="font-bold font-sora text-lg mb-2 mt-10">Software & IT</h3>
                <p className="text-sm opacity-90">Custom development</p>
              </motion.div>
            </div>

            {/* Decorative blob background */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-200/20 to-blue-200/20 dark:from-emerald-500/10 dark:to-blue-500/10 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Option 2: Replace decorative cards with actual image when available */}
          {/* Uncomment and use this when you have an image */}
          {/* 
          <motion.div
            variants={imageVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative">
              <img
                src="/path-to-your-image.jpg"
                alt="SHERO Team"
                className="rounded shadow-2xl w-full h-auto object-cover"
              />
              
              <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-white rounded p-6 shadow-xl">
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </motion.div>
          */}
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
