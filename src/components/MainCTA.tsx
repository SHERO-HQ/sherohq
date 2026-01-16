import { NavLink } from "react-router-dom";
import { easeOut, motion } from "motion/react";
import {
  ShoppingBag,
  MessageSquare,
  Handshake,
  Code,
  Route,
} from "lucide-react";

const MainCTA = () => {
  const paths = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      label: "For Everyone",
      title: "Shop Products",
      description:
        "Browse our curated collection of premium tech accessories and hardware.",
      cta: "Browse Store",
      link: "/products",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      label: "For Businesses",
      title: "Get Consultation",
      description:
        "Expert tech advisory on strategy, infrastructure, and digital transformation.",
      cta: "Book Consultation",
      link: "/consultation",
      gradient: "from-emerald-500 to-emerald-600",
      hoverGradient: "hover:from-emerald-600 hover:to-emerald-700",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      label: "For Partners",
      title: "Join Our Network",
      description:
        "Collaborate through tech integration, referrals, or investment opportunities.",
      cta: "Become a Partner",
      link: "/partners",
      gradient: "from-indigo-500 to-indigo-600",
      hoverGradient: "hover:from-indigo-600 hover:to-indigo-700",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: <Code className="w-8 h-8" />,
      label: "For Enterprises",
      title: "Software & IT Solutions",
      description:
        "Custom development, SaaS platforms, IT services, and API integration.",
      cta: "Request Quote",
      link: "/solutions",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "hover:from-purple-600 hover:to-purple-700",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  return (
    <section className="relative w-full py-20 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <Route className="size-5" />
            Choose Your Path
          </span>
          <h2 className="text-4xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-4">
            How Can We Help You?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Whether you're shopping for tech, seeking partnerships, or need
            expert consultation, we're here to help you redefine what's
            possible.
          </p>
        </motion.div>

        {/* Three Paths Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {paths.map((path, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              <div
                className="relative h-full bg-white dark:bg-slate-900 rounded p-8 
                            border-2 border-slate-200 dark:border-slate-800
                            hover:border-transparent
                            shadow-lg hover:shadow-2xl
                            transition-all duration-300 overflow-hidden"
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${path.gradient} 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                />
                <div className="absolute inset-0.5 bg-white dark:bg-slate-900 rounded -z-10" />

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded
                              ${path.iconBg} ${path.iconColor} mb-6
                              group-hover:scale-110 transition-transform duration-300`}
                >
                  {path.icon}
                </div>

                {/* Label */}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ms-2">
                  {path.label}
                </span>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 mb-4">
                  {path.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {path.description}
                </p>

                {/* CTA Button */}
                <NavLink
                  to={path.link}
                  className={`inline-flex items-center justify-center gap-2 w-full
                           text-white bg-linear-to-r ${path.gradient}
                           ${path.hoverGradient}
                           px-6 py-3 rounded font-semibold
                           shadow-lg shadow-black/10
                           hover:shadow-xl hover:gap-3
                           transition-all duration-300 group`}
                >
                  <span>{path.cta}</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
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

                {/* Decorative corner */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${path.gradient}
                              opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Not sure which path is right for you?{" "}
            <NavLink
              to="/contact"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Contact us
            </NavLink>{" "}
            and we'll help you get started.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MainCTA;
