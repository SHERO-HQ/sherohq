import { easeOut, motion } from "framer-motion";
import { Code, TrendingUp, Rocket, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";

interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "Coming Soon" | "Accepting Applications" | "Beta";
  timeline: string;
  features: string[];
  color: string;
  gradient: string;
}

const ComingSoonServices = () => {
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services: Service[] = [
    {
      title: "Tech Solutions",
      description:
        "Custom software development, SaaS platforms, and digital systems tailored to your business needs.",
      icon: <Code className="w-8 h-8" />,
      status: "Coming Soon",
      timeline: "Q2 --",
      features: [
        "Custom Software Development",
        "SaaS Platform Development",
        "API Integration Services",
        "Cloud Infrastructure Setup",
      ],
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Finance Services",
      description:
        "Innovative fintech solutions to streamline your financial operations and drive growth.",
      icon: <TrendingUp className="w-8 h-8" />,
      status: "Coming Soon",
      timeline: "Q3 --",
      features: [
        "Financial Analytics",
        "Payment Gateway Integration",
        "Automated Accounting",
        "Financial Reporting Tools",
      ],
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Startup Seeding",
      description:
        "Investment and partnership opportunities for promising startups ready to scale.",
      icon: <Rocket className="w-8 h-8" />,
      status: "Accepting Applications",
      timeline: "Now Open",
      features: [
        "Seed Funding",
        "Mentorship Programs",
        "Network Access",
        "Technical Resources",
      ],
      color: "indigo",
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Early access signup:", email, selectedService);
    // Add your signup logic here
    alert(
      `Thank you! We'll notify you when ${
        selectedService || "our services"
      } launch.`
    );
    setEmail("");
    setSelectedService(null);
  };

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
    <section className="relative w-full py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-1.5 mb-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <Calendar className="mr-2 w-4 h-4" />
            Coming Soon
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-200 mb-4">
            Future Services
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Be among the first to access our upcoming services designed to help
            you redefine what's possible
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
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
                className={`absolute inset-0 bg-gradient-to-br ${service.gradient} 
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
              {/* Status Badge */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold mb-6 ms-2
                ${
                  service.status === "Accepting Applications"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {service.status}
              </div>
              {/* Content */}
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {service.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Timeline */}
              <div className="flex items-center gap-2 mb-6 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {service.timeline}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded bg-linear-to-r ${service.gradient} mt-2 shrink-0`}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setSelectedService(service.title)}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded
                         bg-linear-to-r ${service.gradient} text-slate-200 font-semibold cursor-pointer
                         hover:shadow-lg hover:gap-3
                         transition-all duration-300`}
              >
                <span>
                  {service.status === "Accepting Applications"
                    ? "Apply Now"
                    : "Get Notified"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Early Access Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative max-w-2xl mx-auto"
        >
    
      
          <div className="relative rounded p-8 dark:text-slate-200 text-slate-700 shadow">
                        <div
            className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-blue-500/5"
          />
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Get Early Access
              </h3>
              <p className="dark:text-emerald-200 text-slate-700">
                Join our waitlist and be the first to know when we launch
                {selectedService ? ` ${selectedService}` : " new services"}
              </p>
            </div>

            <form
              onSubmit={handleEarlyAccess}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="focus:outline-none border-2 border-slate-500 dark:border-slate-400 focus:ring-2 focus:ring-emerald-500/30 p-1 rounded w-full flex justify-between">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 text-slate-900 dark:text-slate-200 border-2 ps-1
                border-none outline-none
                transition-all"
                />
                <button
                  type="submit"
                  className="px-8 py-2 bg-emerald-600 text-slate-100  rounded font-semibold
               hover:bg-emerald-600/90  shadow hover:shadow-xl
                transition-all duration-300
                whitespace-nowrap cursor-pointer"
                >
                  Notify Me
                </button>
              </div>
            </form>

            {selectedService && (
              <p className="text-center mt-4 text-sm text-emerald-50">
                You'll receive updates about <strong>{selectedService}</strong>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComingSoonServices;
