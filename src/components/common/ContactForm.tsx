import { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/services/api";

const ContactForm = () => {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await sendContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      setStatus("success");
      setFormData({ name: "", email: "", subject: "general", message: "" });
    } catch (error) {
      console.error("Contact error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-slate-900 dark:text-slate-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-bold text-slate-900 dark:text-slate-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-sm font-bold text-slate-900 dark:text-slate-300"
          >
            Subject
          </label>
          <div className="relative">
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
            >
              <option value="general">General Inquiry</option>
              <option value="project">New Project</option>
              <option value="partnership">Partnership</option>
              <option value="support">Support</option>
              <option value="feedback">Feedback</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-sm font-bold text-slate-900 dark:text-slate-300"
          >
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full px-4 py-2 rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            placeholder="Tell us about your project..."
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={status !== "idle"}
            className="w-full h-10 text-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {status === "idle" && (
              <>
                Send Message <Send className="ml-2 w-5 h-3" />
              </>
            )}
            {status === "submitting" && "Encrypting & Sending..."}
            {status === "success" && (
              <>
                Sent Successfully <CheckCircle2 className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </div>

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 rounded flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              Message received! Our team will get back to you within 2 hours.
            </p>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
