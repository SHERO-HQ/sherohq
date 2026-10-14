"use client";

import React, { useState } from "react";
import { Clock, ArrowRight, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { getCsrfToken } from "@/services/client";
import { MerchanderArt } from "@/components/illustrations";

const ROWS = [
  {
    today: "Orders scattered across chats and screenshots",
    with: "Every order from WhatsApp and Instagram in one list",
  },
  {
    today: "Payments checked by scrolling through MoMo messages",
    with: "Payments recorded with a digital receipt",
  },
  {
    today: "Stock counted by hand",
    with: "Stock that updates itself, even when the internet drops",
  },
  {
    today: "Pre-orders tracked from memory",
    with: "Pre-orders tracked from deposit to delivery",
  },
];

const inputClass =
  "w-full px-4 py-3 rounded border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50";

export const MerchanderView: React.FC = () => {
  const [form, setForm] = useState({ name: "", businessName: "", phone: "", sells: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-CSRF-Protection": "1",
      };
      const token = getCsrfToken();
      if (token) headers["x-csrf-token"] = token;

      const res = await fetch("/api/merchander/waitlist", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <section className="relative overflow-hidden pt-10 pb-12 md:pt-14 md:pb-16 border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-6">
            <Clock className="w-3.5 h-3.5" />
            <span>In development</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            One place to run a business that sells on social media.
          </h1>
          <div className="mt-8 flex justify-center">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-brand-secondary-800 hover:bg-brand-secondary-700 text-white font-medium text-sm transition-all shadow-sm"
            >
              Join the waitlist
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <MerchanderArt className="mx-auto mt-10 max-w-xs sm:max-w-sm" />
        </div>
      </section>

      <section className="py-14 border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-3">The problem</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you sell on WhatsApp or Instagram, your business lives in chats, screenshots and
              notebooks. Orders get lost, payments are hard to confirm, and pre-orders for imported
              goods are tracked by memory.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-3">Who it&apos;s for</h2>
            <p className="text-muted-foreground leading-relaxed">
              Merchants who sell through social media: importers, resellers, boutiques and other
              small businesses.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 border-b border-border bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-6">Today vs with Merchander</h2>
          <div className="grid grid-cols-2 gap-px bg-border rounded overflow-hidden border border-border text-sm">
            <div className="bg-card px-4 py-3 font-semibold text-muted-foreground">Today</div>
            <div className="bg-card px-4 py-3 font-semibold text-foreground">With Merchander</div>
            {ROWS.map((row) => (
              <React.Fragment key={row.today}>
                <div className="bg-card px-4 py-4 text-muted-foreground">{row.today}</div>
                <div className="bg-card px-4 py-4 text-foreground">{row.with}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-14">
        <div className="container max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-2">Join the waitlist</h2>
          <p className="text-sm text-muted-foreground mb-6">Tell us about your business.</p>

          {status === "success" ? (
            <div className="flex items-start gap-3 p-4 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Thanks. We&apos;ll contact you when it&apos;s ready.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                className={inputClass}
                placeholder="Your name"
                aria-label="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                className={inputClass}
                placeholder="Business name"
                aria-label="Business name"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
              <input
                required
                type="tel"
                className={inputClass}
                placeholder="Phone"
                aria-label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                required
                rows={3}
                className={inputClass}
                placeholder="What do you sell?"
                aria-label="What do you sell?"
                value={form.sells}
                onChange={(e) => setForm({ ...form, sells: e.target.value })}
              />
              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-brand-secondary-800 hover:bg-brand-secondary-700 text-white font-medium text-sm transition-all disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Join the waitlist"}
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default MerchanderView;
