"use client";
import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "motion/react";
import {
  Send,
  CheckCircle2,
  Code,
  HelpCircle,
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
    orderId: ""});

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const step2FirstFocusRef = useRef<HTMLButtonElement>(null);

  const handleSelectType = (type: "proposal" | "general" | "order" | "partnership") => {
    setInquiryType(type);
    setDirection(1);
    setStep(2);
  };

  useEffect(() => {
    if (step === 2 && step2FirstFocusRef.current) {
      // Focus the Back button when arriving on step 2 for keyboard accessibility
      step2FirstFocusRef.current.focus();
    }
  }, [step]);

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
    setTimeout(() => setInquiryType(null), 300); // Clear after animation
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
        hardware: "Hardware Supply & POS Setup"}[formData.proposalService] || formData.proposalService;

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
        message: formattedMessage});
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        message: "",
        proposalService: "software",
        proposalSize: "10-50",
        orderId: ""});
      setStep(1);
      setInquiryType(null);
    } catch (error) {
      console.error("Contact submission error:", error);
      setStatus("error");
    }
  };

  const totalSteps = 2;
  const currentDisplayStep = step;

  return (
    <div className="w-full glass-surface-md border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 rounded shadow-xl relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Screen Reader Live Region for Announcements */}
      <div aria-live="polite" className="sr-only">
        {status === "submitting" && "Encrypting and sending message..."}
        {status === "success" && "Message transmitted successfully."}
        {status === "error" && "Failed to send message. Please try again."}
      </div>

      {/* Step Indicator Header */}
      {inquiryType && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 rounded px-1 py-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step {currentDisplayStep} of {totalSteps}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 1 ? "bg-brand-secondary-600 scale-110" : "bg-slate-200 dark:bg-slate-700"}`} />
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 2 ? "bg-brand-secondary-600 scale-110" : "bg-slate-200 dark:bg-slate-700"}`} />
            </div>
          </div>
        </div>
      )}

      {status === "success" && (
        <m.div
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
            className="rounded px-6 mt-4 focus-visible:ring-2 focus-visible:ring-brand-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Send Another Message
          </Button>
        </m.div>
      )}

      {status !== "success" && (
        <form onSubmit={handleSubmit} className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <m.div
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
                    {/* Option 1: Proposal (Primary Green) */}
                    <m.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("proposal")}
                      className="group p-5 text-left rounded border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-brand-primary-500/50 dark:hover:border-brand-primary-400/30 hover:bg-brand-primary-500/5 dark:hover:bg-brand-primary-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      <div className="p-2.5 rounded bg-brand-primary-500/10 dark:bg-brand-primary-500/10 text-brand-primary-600 dark:text-brand-primary-400 shrink-0 transition-transform group-hover:scale-105">
                        <Code className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 transition-colors flex items-center justify-between gap-2">
                          <span>Request Proposal</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Get a custom quote for software dev, cloud migration, or managed IT SLAs.
                        </p>
                      </div>
                    </m.button>

                    {/* Option 2: General (Secondary Blue) */}
                    <m.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("general")}
                      className="group p-5 text-left rounded border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-400/30 hover:bg-brand-secondary-500/5 dark:hover:bg-brand-secondary-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      <div className="p-2.5 rounded bg-brand-secondary-500/10 dark:bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400 shrink-0 transition-transform group-hover:scale-105">
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
                    </m.button>

                    {/* Option 3: Support (Emerald) */}
                    <m.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("order")}
                      className="group p-5 text-left rounded border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-emerald-500/50 dark:hover:border-emerald-400/30 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      <div className="p-2.5 rounded bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform group-hover:scale-105">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between gap-2">
                          <span>Order & Support</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Troubleshoot current online order statuses or ask for product setup help.
                        </p>
                      </div>
                    </m.button>

                    {/* Option 4: Partnerships (Amber) */}
                    <m.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleSelectType("partnership")}
                      className="group p-5 text-left rounded border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-amber-500/50 dark:hover:border-amber-400/30 hover:bg-amber-500/5 dark:hover:bg-amber-500/5 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      <div className="p-2.5 rounded bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 transition-transform group-hover:scale-105">
                        <Verified className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between gap-2">
                          <span>Collabs & Careers</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all group-hover:translate-x-1 shrink-0" />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Inquire about joint venture collaborations, hardware vendor contracts, or careers.
                        </p>
                      </div>
                    </m.button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTEXTUAL SPECIFICS & CONTACT DETAILS */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Contextual Fields (Rendered at top if applicable) */}
                  {inquiryType === "proposal" && (
                    <div className="space-y-5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Project Requirements
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Project Requirements">
                        {[
                          { id: "software", label: "Custom Software", icon: Code },
                          { id: "cloud", label: "Cloud Systems", icon: Server },
                          { id: "mit", label: "Managed IT SLA", icon: Shield },
                          { id: "hardware", label: "Hardware & POS", icon: Zap },
                        ].map((serv) => (
                          <button
                            key={serv.id}
                            type="button"
                            role="radio"
                            aria-checked={formData.proposalService === serv.id}
                            onClick={() => setFormData({ ...formData, proposalService: serv.id })}
                            className={`flex items-center gap-2.5 p-3 border-2 text-left text-xs font-semibold transition cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${formData.proposalService === serv.id
                              ? "border-brand-secondary-500 bg-brand-secondary-500/5 text-slate-900 dark:text-white"
                              : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                          >
                            <serv.icon className={`w-4 h-4 ${formData.proposalService === serv.id ? "text-brand-secondary-500" : "text-slate-400"}`} aria-hidden="true" />
                            {serv.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1" role="radiogroup" aria-label="Organization Size">
                        {["<10 members", "10-50 members", "50+ members"].map((size) => (
                          <button
                            key={size}
                            type="button"
                            role="radio"
                            aria-checked={formData.proposalSize === size.split(" ")[0]}
                            onClick={() => setFormData({ ...formData, proposalSize: size.split(" ")[0] })}
                            className={`flex-1 py-2 text-center text-xs font-semibold border-2 transition cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${formData.proposalSize === size.split(" ")[0]
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
                    <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Order Details
                        </h3>
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
                          className="w-full px-4 py-2.5 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition"
                          placeholder="e.g. #E4G432901"
                        />
                      </div>
                    </div>
                  )}

                  {/* Standard Contact Fields */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Your Information
                    </h3>
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
                        className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition"
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
                        className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition"
                        placeholder="john@shero.com"
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
                      className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/10 focus:border-brand-secondary-500 transition resize-none"
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
                      ref={step2FirstFocusRef}
                      onClick={handleBack}
                      className="flex items-center rounded gap-1 px-4 h-10 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500"
                    >
                      Back
                    </button>
                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      className="flex-1 md:flex-none px-8 h-10 text-sm font-bold bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white shadow-md shadow-brand-secondary-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      {status === "submitting" ? (
                        <span aria-hidden="true">Sending...</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Submit Inquiry <Send className="w-4 h-4" aria-hidden="true" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </m.div>
          </AnimatePresence>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
