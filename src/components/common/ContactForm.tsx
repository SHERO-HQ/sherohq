"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  CheckCircle2,
  ChevronDown,
  Code,
  HelpCircle,
  Briefcase,
  Verified,
  ArrowRight,
  ArrowLeft,
  Server,
  Shield,
  Zap,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/services/api";

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [inquiryType, setInquiryType] = useState<"proposal" | "general" | "order" | "partnership" | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    // Proposal-specific fields
    proposalService: "software", // "software" | "cloud" | "mit" | "hardware"
    proposalSize: "10-50",       // "<10" | "10-50" | "50+"
    // Order-specific fields
    orderId: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSelectType = (type: "proposal" | "general" | "order" | "partnership") => {
    setInquiryType(type);
    setDirection(1);
    if (type === "proposal" || type === "order") {
      setStep(2);
    } else {
      setStep(3); // Skip step 2 for general and partnership
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (step === 3 && (inquiryType === "general" || inquiryType === "partnership")) {
      setStep(1);
      setInquiryType(null);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setInquiryType(null);
    }
  };

  const handleContinue = () => {
    setDirection(1);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    let formattedMessage = formData.message;
    let subject = "general";

    if (inquiryType === "proposal") {
      subject = "project";
      const serviceLabel = {
        software: "Custom Software Development",
        cloud: "Cloud & Infrastructure Solutions",
        mit: "Managed IT Support & SLA",
        hardware: "Hardware Supply & POS Setup",
      }[formData.proposalService] || formData.proposalService;

      formattedMessage = `[Custom Project Proposal Request]
• Service Requested: ${serviceLabel}
• Organization Size: ${formData.proposalSize} members

Additional Details:
${formData.message}`;
    } else if (inquiryType === "order") {
      subject = "support";
      formattedMessage = `[Order Support Request]
• Order ID: ${formData.orderId || "Not Provided"}

Support Details:
${formData.message}`;
    } else if (inquiryType === "partnership") {
      subject = "partnership";
      formattedMessage = `[Partnership & Careers Inquiry]
Inquiry Details:
${formData.message}`;
    }

    try {
      await sendContactMessage({
        name: formData.name,
        email: formData.email,
        subject: subject,
        message: formattedMessage,
      });
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        message: "",
        proposalService: "software",
        proposalSize: "10-50",
        orderId: "",
      });
      setStep(1);
      setInquiryType(null);
    } catch (error) {
      console.error("Contact submission error:", error);
      setStatus("error");
    }
  };

  const totalSteps = inquiryType === "proposal" || inquiryType === "order" ? 3 : 2;
  const currentDisplayStep = step === 3 && (inquiryType === "general" || inquiryType === "partnership") ? 2 : step;

  return (
    <div className="w-full max-w-2xl mx-auto glass-surface-md border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 rounded shadow-xl select-none relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Step Indicator Header */}
      {inquiryType && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step {currentDisplayStep} of {totalSteps}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 1 ? "bg-brand-secondary-600 scale-110" : "bg-slate-200 dark:bg-slate-700"}`} />
              {(inquiryType === "proposal" || inquiryType === "order") && (
                <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 2 ? "bg-brand-secondary-600 scale-110" : "bg-slate-200 dark:bg-slate-700"}`} />
              )}
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 3 ? "bg-brand-secondary-600 scale-110" : "bg-slate-200 dark:bg-slate-700"}`} />
            </div>
          </div>
        </div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8 space-y-4"
        >
          <div className="w-16 h-16 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-brand-secondary-600 dark:text-brand-secondary-400 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Message Transmitted!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Thank you for reaching out. We have logged your request and our team will get back to you within 2 hours.
          </p>
          <Button
            onClick={() => setStatus("idle")}
            variant="outline"
            className="rounded px-6 mt-4"
          >
            Send Another Message
          </Button>
        </motion.div>
      )}

      {status !== "success" && (
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {/* STEP 1: ROUTING CARDS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      How can we help you today?
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Select the option that matches your inquiry to get started.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Option 1: Proposal */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("proposal")}
                      className="group p-5 text-left rounded border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-400/30 hover:bg-brand-secondary-500/5 dark:hover:bg-brand-secondary-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full"
                    >
                      <div className="p-2.5  bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 transition-transform group-hover:scale-105">
                        <Code className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors flex items-center justify-between gap-2">
                          <span>Request Proposal</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-brand-secondary-500 dark:group-hover:text-brand-secondary-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Get a custom quote for software dev, cloud migration, or managed IT SLAs.
                        </p>
                      </div>
                    </motion.button>

                    {/* Option 2: General */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("general")}
                      className="group p-5 text-left rounded border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-400/30 hover:bg-brand-secondary-500/5 dark:hover:bg-brand-secondary-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full"
                    >
                      <div className="p-2.5  bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 transition-transform group-hover:scale-105">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors flex items-center justify-between gap-2">
                          <span>General Inquiry</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-brand-secondary-500 dark:group-hover:text-brand-secondary-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Ask quick questions about shop deliveries, local branches, or store pickups.
                        </p>
                      </div>
                    </motion.button>

                    {/* Option 3: Support */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("order")}
                      className="group p-5 text-left rounded border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-400/30 hover:bg-brand-secondary-500/5 dark:hover:bg-brand-secondary-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full"
                    >
                      <div className="p-2.5  bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform group-hover:scale-105">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors flex items-center justify-between gap-2">
                          <span>Order & Support</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-brand-secondary-500 dark:group-hover:text-brand-secondary-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Troubleshoot current online order statuses or ask for product setup help.
                        </p>
                      </div>
                    </motion.button>

                    {/* Option 4: Partnerships */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("partnership")}
                      className="group p-5 text-left rounded border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-400/30 hover:bg-brand-secondary-500/5 dark:hover:bg-brand-secondary-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full"
                    >
                      <div className="p-2.5  bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 transition-transform group-hover:scale-105">
                        <Verified className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors flex items-center justify-between gap-2">
                          <span>Collabs & Careers</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-brand-secondary-500 dark:group-hover:text-brand-secondary-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Inquire about joint venture collaborations, hardware vendor contracts, or careers.
                        </p>
                      </div>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTEXTUAL SPECIFICS */}
              {step === 2 && (
                <div className="space-y-6">
                  {inquiryType === "proposal" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Select the Target Service
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Which ecosystem solution is most aligned with your goals?
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "software", label: "Custom Software", icon: Code },
                          { id: "cloud", label: "Cloud Systems", icon: Server },
                          { id: "mit", label: "Managed IT SLA", icon: Shield },
                          { id: "hardware", label: "Hardware & POS", icon: Zap },
                        ].map((serv) => (
                          <button
                            key={serv.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, proposalService: serv.id })}
                            className={`flex items-center gap-2.5 p-3 border-2 text-left text-xs font-semibold transition cursor-pointer rounded ${formData.proposalService === serv.id
                              ? "border-brand-secondary-500 bg-brand-secondary-500/5 text-slate-900 dark:text-white"
                              : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                          >
                            <serv.icon className={`w-4 h-4 ${formData.proposalService === serv.id ? "text-brand-secondary-500" : "text-slate-400"}`} />
                            {serv.label}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Organization Scale
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Choose the bracket that closest fits your current team.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {["<10 members", "10-50 members", "50+ members"].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({ ...formData, proposalSize: size.split(" ")[0] })}
                            className={`flex-1 py-2 text-center text-xs font-semibold border-2 transition cursor-pointer rounded ${formData.proposalSize === size.split(" ")[0]
                              ? "border-brand-secondary-500 bg-brand-secondary-500/5 text-slate-900 dark:text-white font-bold"
                              : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {inquiryType === "order" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Enter your Order ID
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Providing a valid Order ID helps our checkout team pull up details instantly.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="orderId" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Order ID (Optional)
                        </label>
                        <input
                          id="orderId"
                          type="text"
                          value={formData.orderId}
                          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                          className="w-full px-4 py-2.5  border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition"
                          placeholder="e.g. #SHERO-202612"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 h-10  text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Back
                    </button>
                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="px-6 h-10  text-sm font-bold bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT & MESSAGE */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Tell us more
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Provide your coordinates and inquiry details so we can reach you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Message details
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition resize-none"
                      placeholder={
                        inquiryType === "proposal"
                          ? "Briefly tell us about your project features, expected timelines, or integrations..."
                          : inquiryType === "order"
                            ? "State what product is affected or what delivery issue you are experiencing..."
                            : inquiryType === "partnership"
                              ? "Share details about your partnership proposal or background careers inquiry..."
                              : "Type your general inquiry or question here..."
                      }
                    />
                  </div>

                  <div className="flex justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center rounded gap-1 px-4 h-10  text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Back
                    </button>
                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      className="flex-1 md:flex-none px-8 h-10  text-sm font-bold bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white shadow-md shadow-brand-secondary-500/20"
                    >
                      {status === "submitting" ? (
                        "Encrypting & Sending..."
                      ) : (
                        <>
                          Submit Inquiry <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
