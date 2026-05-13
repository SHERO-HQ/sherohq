import React from "react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { HatGlasses, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Send Feedback — SHERO TECHNOLOGIES",
  description:
    "We'd love to hear from you. Share your feedback and help us improve.",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            We'd Love to Hear From You
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Your feedback shapes our future. Share your thoughts to help us build and offer
            better products and services.
          </p>
        </div>

        {/* Form Container */}
        <div className="mb-12 rounded bg-white dark:bg-slate-900 p-4 sm:p-12 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 hover:shadow-md hover:ring-slate-300">
          <FeedbackForm />
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded bg-white dark:bg-slate-800 p-4 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 hover:ring-slate-300">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-900 dark:text-slate-200" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-200">Privacy Protected</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your feedback is securely stored and only viewed by our team.
            </p>
          </div>
          <div className="rounded dark:bg-slate-800 bg-white p-4 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 hover:ring-slate-300">
            <div className="mb-3 flex items-center gap-2">
              <HatGlasses className="h-4 w-4 text-slate-900 dark:text-slate-200" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-200">Stay Anonymous</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Optionally submit feedback without sharing your name or email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
