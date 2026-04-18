"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative inline-flex mb-4">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 bg-linear-to-br from-red-500 to-rose-600 rounded flex items-center justify-center text-white shadow">
            <AlertTriangle className="size-10" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
            Something went wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We encountered an unexpected error. Don't worry, our engineers have
            been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded font-bold transition hover:bg-brand-secondary-600 dark:hover:bg-brand-secondary-500 dark:hover:text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Home className="size-4" />
            Back Home
          </Link>
        </div>

        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-8">
            Error ID: {error.digest || 'Internal-System-Failure'}
        </p>
      </motion.div>
    </div>
  );
}
