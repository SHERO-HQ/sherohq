"use client";

import React, { useState } from "react";
import { m } from "motion/react";
import {
  Zap,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Store,
  Layers,
  Clock,
  Send,
} from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";

const BUSINESS_TYPES = [
  "Retail Store / Shop",
  "Wholesale & Distribution",
  "Fashion & Boutique",
  "Pharmacy / Healthcare",
  "Electronics & Computers",
  "Supermarket & Groceries",
  "Hardware & Building Materials",
  "Restaurant / Food Service",
  "Other Business",
];

const FEATURES = [
  {
    icon: Receipt,
    title: "Fast POS & MoMo Reconciliation",
    desc: "Ring up sales in seconds, record cash and mobile money seamlessly, and match payments to transactions with zero end-of-day guesswork.",
  },
  {
    icon: Layers,
    title: "Real-Time Stock & Low-Inventory Alerts",
    desc: "Track stock across one or multiple branch locations. Get proactive notifications when your fastest-moving products run low.",
  },
  {
    icon: Users,
    title: "Customer Ledger & Credit Tracking",
    desc: "Keep a transparent record of repeat customers, credit balances, and partial payments with polite automated reminders.",
  },
  {
    icon: TrendingUp,
    title: "Clear Daily Profits & Cash Flow",
    desc: "View your real daily margins, gross profits, and top revenue drivers on your phone or laptop without complicated spreadsheet formulas.",
  },
];

const TARGET_AUDIENCE = [
  {
    title: "Retail Shops & Boutiques",
    desc: "Speed up daily sales, prevent stock shrinkage, and give customers digital receipts.",
    icon: Store,
  },
  {
    title: "Wholesalers & Distributors",
    desc: "Manage high-volume order dispatches, branch stock movements, and merchant credit accounts.",
    icon: Building2,
  },
  {
    title: "Pharmacies & Specialized Outlets",
    desc: "Track fast-moving inventory, batch movements, and daily cash-drawer reconciliations.",
    icon: ShoppingBag,
  },
];

export const MerchanderView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    businessType: "Retail Store / Shop",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/merchander/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors ">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 border-b border-border">
        <div className="absolute inset-0 hero-grid-pattern opacity-5 dark:opacity-20 pointer-events-none" />


        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Prominent Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Status: In Development</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Merchander
          </h1>

          <p className="mt-3 text-lg sm:text-xl font-medium text-brand-secondary-600 dark:text-brand-secondary-400">
            A clear, dependable operating platform for growing merchants.
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Designed to give growing businesses a straightforward platform to record daily sales,
            track branch inventory, reconcile Mobile Money, and manage customer credit without clunky, overpriced software.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              Join the Early Access Waitlist
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950/60 border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <SectionBadge icon={AlertCircle} className="mb-3">
              The Reality
            </SectionBadge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              The Problem in Plain Words
            </h2>
          </div>

          <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 sm:p-10 shadow-xs space-y-5 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            <p>
              Most retail shops and distributors across Ghana and West Africa run on messy physical notebooks,
              paper receipts, and personal mobile phones.
            </p>
            <p>
              At the end of every business day, shop owners spend grueling hours trying to reconcile cash with multiple
              Mobile Money notifications, tracing customer debts across dog-eared notebook pages, and guessing what goods
              to reorder before the shelves run dry.
            </p>
            <p>
              Existing enterprise software is built for distant corporations: expensive, overly complicated, and
              unreliable when local connectivity flickers. Merchander is built specifically to remove these daily headaches.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 sm:py-20 bg-background border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <SectionBadge icon={Users} className="mb-3">
              Audience
            </SectionBadge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Who It&apos;s For
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Built for people building real commerce in our cities and towns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TARGET_AUDIENCE.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between hover:border-brand-secondary-500/40 transition-colors shadow-xs"
                >
                  <div>
                    <div className="w-10 h-10 rounded bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-600 dark:text-brand-secondary-400 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What It Will Do */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950/60 border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <SectionBadge icon={Zap} className="mb-3">
              Capabilities
            </SectionBadge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              What Merchander Will Do
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Four core foundations designed for fast daily operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 hover:border-brand-secondary-500/40 transition-colors shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 shrink-0 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-secondary-600 dark:text-brand-secondary-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section id="waitlist" className="py-16 sm:py-24 bg-background">
        <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <SectionBadge icon={Send} className="mb-3">
              Early Access
            </SectionBadge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Join the Merchander Waitlist
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              We&apos;re onboarding pilot merchants first. Reserve your spot for private early testing and special launch pricing.
            </p>
          </div>

          <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-md">
            {status === "success" ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  You&apos;re On the List!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-900 dark:text-white">{formData.name}</span>.
                  We have saved your details and will contact you directly at{" "}
                  <span className="font-mono text-xs">{formData.email}</span> when private merchant access begins.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setFormData({
                      name: "",
                      phone: "",
                      email: "",
                      businessType: "Retail Store / Shop",
                    });
                  }}
                  className="mt-4 text-xs font-semibold text-brand-secondary-600 hover:underline"
                >
                  Register another business
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === "error" && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full px-3.5 py-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-secondary-500 focus:ring-1 focus:ring-brand-secondary-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 054 871 1582"
                      className="w-full px-3.5 py-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-secondary-500 focus:ring-1 focus:ring-brand-secondary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. kwame@example.com"
                      className="w-full px-3.5 py-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-secondary-500 focus:ring-1 focus:ring-brand-secondary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-secondary-500 focus:ring-1 focus:ring-brand-secondary-500 transition-colors"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 px-4 rounded bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-medium text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-2">
                  We respect your privacy. No spam. You will only receive genuine pilot updates.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MerchanderView;
