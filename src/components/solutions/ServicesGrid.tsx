"use client";
import { easeOut, m } from "motion/react";
import {
  Smartphone,
  Cloud,
  Workflow,
  Settings,
  CheckCircle,
  Briefcase,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import SpotlightCard from "@/components/motion/SpotlightCard";

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  textClass: string;
}

const ServicesGrid = () => {
  const services: Service[] = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Hardware Supply & Support",
      description:
        "We supply, configure, and maintain reliable computers, servers, networking gear, and workstations tailored for business operations.",
      features: [
        "Business laptops & workstations",
        "Office hardware procurement & setup",
        "Servers & networking gear",
        "Hardware support & warranty guidance",
      ],
      gradient: "from-blue-500 to-blue-600",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Custom Software & Apps",
      description:
        "We design, build, and support custom web applications, mobile apps, and internal digital tools engineered for your exact business workflows.",
      features: [
        "Responsive web applications",
        "Internal business management software & dashboards",
        "Mobile & web application development",
        "Custom cloud product development",
      ],
      gradient: "from-brand-secondary-500 to-brand-secondary-600",
      textClass: "text-brand-secondary-600 dark:text-brand-secondary-400",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Managed IT & Infrastructure",
      description:
        "Complete IT setup and proactive system maintenance — from server management to network security. We keep your tech running smoothly.",
      features: [
        "Office workstation setup & IT onboarding",
        "Server & local office network configuration",
        "Technical support & IT troubleshooting",
        "Data backups & system maintenance",
      ],
      gradient: "from-brand-primary-500 to-brand-primary-600",
      textClass: "text-brand-primary-600 dark:text-brand-primary-400",
    },
    {
      icon: <Workflow className="w-8 h-8" />,
      title: "Systems & API Integration",
      description:
        "Link your payment gateways, inventory, POS, CRM, and business software into one smooth workflow with zero manual friction.",
      features: [
        "Payment gateway setup & integration",
        "POS & inventory software synchronization",
        "RESTful API & third-party software integration",
        "Business workflow automation",
      ],
      gradient: "from-brand-secondary-500 to-brand-secondary-600",
      textClass: "text-brand-secondary-600 dark:text-brand-secondary-400",
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
    <section id="services" className="w-full pb-10 bg-white dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] uppercase font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded transition-colors duration-300">
            <Briefcase className="size-4" />
            Our Services
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">
            What We Do
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From custom apps to complete IT management — solutions designed
            to help your business grow
          </p>
        </m.div>

        {/* Services Grid */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service) => (
            <m.div
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="h-full"
            >
              <SpotlightCard
                className="group relative bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 h-full flex flex-col overflow-hidden"
              >
                {/* Hover Glow Background */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="p-6 sm:p-8 flex flex-col h-full relative z-10">
                  {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded mb-6
                  bg-linear-to-br ${service.gradient} text-white
                  group-hover:scale-110 transition-transform duration-300`}
                >
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed flex-grow">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mt-auto mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle
                        className={`w-5 h-5 mt-0.5 shrink-0 ${service.textClass}`}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <a
                  href="/consultation"
                  className={`inline-flex items-center gap-2 ${service.textClass} font-medium
                  hover:gap-3 transition group/link`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                </div>
              </SpotlightCard>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default ServicesGrid;
