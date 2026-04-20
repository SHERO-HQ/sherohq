"use client";
import ContactForm from "@/components/common/ContactForm";
import { motion } from "motion/react";
import {
  Mail,
  MapPin,
  MessageSquareLock,
  MessagesSquare,
  Phone,
} from "lucide-react";
import { COMPANY_EMAILS } from "@/constants/emails";

const Contact = () => {
  return (
    <>
      <div className="relative pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden dark:bg-slate-950 bg-slate-50 min-h-screen">
        {/* Dot Pattern Background */}
        <div className="absolute inset-0 pattern-dots opacity-70 dark:opacity-50 pointer-events-none" />

        {/* Deep Space Background - Dark Mode Only */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-0 dark:opacity-100 transition-opacity duration-500" />

        {/* Soft Light Mode Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-white dark:opacity-0 transition-opacity duration-500" />

        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-secondary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 rounded border border-brand-secondary-500/40 uppercase tracking-wider transition-colors duration-300">
                  <MessageSquareLock className="size-4" />
                  Contact SHERO
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight transition-colors duration-300">
                  Start{" "}
                  <span className="text-brand-secondary-600">Conversation</span>
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Tell us your goals and constraints. We will recommend the
                  right mix of products, software, and support for your stage of
                  growth.
                </p>

                <div className="flex flex-wrap gap-3 mt-7">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
                    24h Response
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
                    Consultative Guidance
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <ContactItem
                  icon={
                    <Mail className="w-5 h-5 text-teal-700 dark:text-brand-secondary-400" />
                  }
                  label="Email Us"
                  value={COMPANY_EMAILS.INFO}
                  delay={0.2}
                />
                <ContactItem
                  icon={
                    <Phone className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  }
                  label="Call Us"
                  value="+233 (54) 871-1582"
                  delay={0.3}
                />
                <ContactItem
                  icon={
                    <MapPin className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                  }
                  label="Visit Us"
                  value="Tamale, Northern Region, Ghana"
                  delay={0.4}
                />
              </div>

              {/* Office Details Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="p-6 bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <MapPin className="w-12 h-12" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Global Presence</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Headquartered in Tamale, we serve the entire West African region with specialized logistics and on-site technical deployment teams.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Column: Glass Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Form Container */}
              <div className="relative bg-white/90 dark:bg-slate-900/90  border border-slate-200 dark:border-white/10 rounded p-6 shadow">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <MessagesSquare className="w-12 h-12" />
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-2">
                    Send Message
                  </h3>
                  <p className="text-sm dark:text-slate-400 text-slate-900">
                    We typically reply within 2hrs.
                  </p>
                </div>

                <ContactForm />
              </div>

              {/* Decorative border glow */}
              <div className="absolute -inset-1 rounded bg-linear-to-br from-brand-secondary-500/5 to-blue-500/5 blur-xl -z-10" />
            </motion.div>
          </div>

          {/* Quick FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-[10px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 bg-brand-secondary-100 dark:bg-brand-secondary-200/20 border border-brand-secondary-500/50 dark:border-brand-secondary-800/50 rounded uppercase transition-colors duration-300">
                <MessagesSquare className="size-4" />
                Quick Answers
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">Frequently Asked</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Common questions before starting a conversation with our team.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-secondary-500 font-mono text-xs">0{idx + 1}</span>
                    {faq.question}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

const faqs = [
  {
    question: "How quickly do you ship hardware?",
    answer: "In-stock enterprise gear typically dispatches within 24-48hrs. Custom configurations or bulk orders may take 5-7 business days."
  },
  {
    question: "Do you provide on-site support?",
    answer: "Yes, we offer on-site deployment and maintenance services across various regions in Ghana. Remote support is available globally."
  },
  {
    question: "Do you offer wholesale pricing?",
    answer: "Absolutely. Our Solution Partners and bulk purchasers access tiered wholesale rates that scale with volume."
  }
];

const ContactItem = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-4 group"
  >
    <div className="w-12 h-12 rounded text-slate-900 dark:text-white bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="dark:text-slate-200 text-slate-900/90 font-medium">
        {value}
      </p>
    </div>
  </motion.div>
);

export default Contact;
