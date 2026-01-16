import { easeOut, motion } from "motion/react";
import {
  Smartphone,
  Cloud,
  Workflow,
  Settings,
  CheckCircle,
  Briefcase,
} from "lucide-react";

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
}

const ServicesGrid = () => {
  const services: Service[] = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Custom Web & Mobile Apps",
      description:
        "Scalable, user-friendly applications built with modern frameworks tailored to your business needs.",
      features: [
        "Responsive web applications",
        "iOS & Android mobile apps",
        "Progressive Web Apps (PWA)",
        "Cross-platform development",
      ],
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "SaaS Platform Development",
      description:
        "Build your software-as-a-service platform with subscription management, multi-tenancy, and more.",
      features: [
        "Multi-tenant architecture",
        "Subscription & billing integration",
        "User management & authentication",
        "Analytics & reporting dashboards",
      ],
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "IT Support & Managed Services",
      description:
        "Comprehensive IT infrastructure management, monitoring, and support to keep your business running.",
      features: [
        "24/7 system monitoring",
        "Infrastructure management",
        "Helpdesk & technical support",
        "Backup & disaster recovery",
      ],
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      icon: <Workflow className="w-8 h-8" />,
      title: "API Development & Integration",
      description:
        "Build robust APIs and seamlessly integrate third-party services into your existing systems.",
      features: [
        "RESTful & GraphQL APIs",
        "Third-party integrations",
        "Payment gateway setup",
        "Microservices architecture",
      ],
      gradient: "from-purple-500 to-purple-600",
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
        duration: 0.6,
        ease: easeOut,
      },
    },
  };

  return (
    <section id="services" className="w-full py-20 bg-white dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded">
          <Briefcase className="size-5" />
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-4">
            What We Build
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            End-to-end software solutions designed to solve your business
            challenges
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-slate-900 rounded p-8
                       border-2 border-slate-200 dark:border-slate-800
                       hover:border-transparent
                       shadow-lg hover:shadow-2xl
                       transition-all duration-300 overflow-hidden"
            >
              {/* Gradient border on hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${service.gradient} 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
              />
              <div className="absolute inset-0.5 bg-white dark:bg-slate-900 rounded -z-10" />

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded mb-6
                            bg-linear-to-br ${service.gradient} text-white
                            group-hover:scale-110 transition-transform duration-300`}
              >
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-sora font-bold text-slate-900 dark:text-slate-100 mb-3">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features List */}
              <ul className="space-y-3">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle
                      className={`w-5 h-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400`}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Learn More Link */}
              <a
                href="#request-quote"
                className="inline-flex items-center gap-2 mt-6 text-emerald-600 dark:text-emerald-400 font-semibold
                         hover:gap-3 transition-all group/link"
              >
                <span>Get Started</span>
                <svg
                  className="w-4 h-4 transition-transform"
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
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesGrid;
