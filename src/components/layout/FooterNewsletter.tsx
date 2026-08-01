"use client";
import { useState } from "react";
import { Send, BadgeCheck } from "lucide-react";
import { subscribeToNewsletter } from "@/services/api";

const FooterNewsletter = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleNewsletterSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const trimmedEmail = newsletterEmail.trim();
    if (!trimmedEmail) return;

    setNewsletterStatus("submitting");
    try {
      await subscribeToNewsletter({
        email: trimmedEmail,
        source: "footer"
      });
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setNewsletterStatus("error");
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stay Updated</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get the latest deals, product drops, and tech news.</p>
      </div>
      <form onSubmit={handleNewsletterSubmit} className="relative">
        <input
          type="email"
          required
          value={newsletterEmail}
          onChange={(e) => {
            setNewsletterEmail(e.target.value);
            if (newsletterStatus !== "idle") setNewsletterStatus("idle");
          }}
          placeholder="Enter your email"
          className="w-full pr-32 pl-4 py-3 text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <button
          type="submit"
          disabled={newsletterStatus === "submitting"}
          className="absolute right-1.5 top-1.5 bottom-1.5 inline-flex items-center gap-2 px-4 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Send className="w-3 h-3" />
          {newsletterStatus === "submitting" ? "..." : "Subscribe"}
        </button>
      </form>
      {newsletterStatus === "success" && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
          <BadgeCheck className="w-3 h-3" /> Successfully subscribed!
        </p>
      )}
    </div>
  );
};

export default FooterNewsletter;
