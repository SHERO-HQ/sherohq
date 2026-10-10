"use client";
import { easeOut, m } from "motion/react";
import {
  Workflow,
  CheckCircle,
  ArrowRight,
  Laptop,
  Code,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import SpotlightCard from "@/components/motion/SpotlightCard";
import { SectionBadge } from "@/components/common/SectionBadge";

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
      icon: <Laptop className="w-5 h-5" />,
      title: "Hardware for Teams",
      description:
        "The right tools to move work forward. We source, inspect, and configure high-performance hardware so your team never loses momentum to poor tech.",
      features: [
        "High-performance laptops configured for your workflow",
        "Rigorous battery and thermal quality benchmarks",
        "Ready-to-use workstations with zero setup friction",
        "Honest specs backed by local support",
      ],
      gradient: "",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Software Engineering & Digital Products",
      description:
        "Purpose-built software engineered to solve real operational bottlenecks. From client portals to core business systems, we build software designed to last.",
      features: [
        "Modern web applications and cloud architectures",
        "Internal operations software and automation dashboards",
        "High-reliability database design and API services",
        "Clean, maintainable codebases with full client ownership",
      ],
      gradient: "",
      textClass: "text-brand-secondary-600 dark:text-brand-secondary-400",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Systems Reliability & IT Operations",
      description:
        "Dependable infrastructure setup and proactive system maintenance. We keep your business tools, workstations, and operational data secure, stable, and ready to perform.",
      features: [
        "Workspace environment & toolchain deployment",
        "Local network security & automated data backups",
        "Direct technical support and rapid issue resolution",
        "Proactive system health checks without corporate bloat",
      ],
      gradient: "",
      textClass: "text-brand-primary-600 dark:text-brand-primary-400",
    },
    {
      icon: <Workflow className="w-5 h-5" />,
      title: "Workflow & API Architecture",
      description:
        "Connect your software, payment processors, and business tools into unified, automated pipelines that eliminate manual data entry and human error.",
      features: [
        "Payment gateway and checkout workflow integration",
        "Real-time inventory and database synchronization",
        "Secure REST & webhook data pipelines",
        "Multi-platform automation connecting mobile and web tools",
      ],
      gradient: "",
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
          <SectionBadge icon={Cpu} className="mb-4">
            Core Capabilities
          </SectionBadge>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors ">
            What We Build & Support
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Purposeful technology built to remove operational friction, automate workflows, and expand what your business can achieve.
          </p>
        </m.div>

        {/* Services Grid (4 col desktop, 2 col tablet/small, 1 col mobile) */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {services.map((service) => (
            <m.div
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <SpotlightCard
                className="group relative bg-white dark:bg-slate-900/60 rounded border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all h-full flex flex-col overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col h-full relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded mb-4 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 ${service.textClass} group-hover:scale-105 transition-transform`}
                  >
                    {service.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed grow">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mt-auto mb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${service.textClass}`}
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Link */}
                  <a
                    href="/consultation"
                    className={`inline-flex items-center gap-1.5 ${service.textClass} text-xs font-semibold hover:gap-2 transition-all mt-auto`}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
