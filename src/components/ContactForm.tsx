import { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactForm = () => {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("success");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-10 bg-white dark:bg-slate-900 rounded shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Subject
          </label>
          <select
            id="subject"
            className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
          >
            <option value="general">General Inquiry</option>
            <option value="project">New Project</option>
            <option value="partnership">Partnership</option>
            <option value="support">Support</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            placeholder="Tell us about your project..."
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={status !== "idle"}
            className="w-full md:w-auto h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {status === "idle" && (
              <>
                Send Message <Send className="ml-2 w-4 h-4" />
              </>
            )}
            {status === "submitting" && "Sending..."}
            {status === "success" && (
              <>
                Sent Successfully <CheckCircle2 className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              Thank you! We've received your message and will get back to you
              shortly.
            </p>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
