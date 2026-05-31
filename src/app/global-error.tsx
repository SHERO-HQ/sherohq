"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 bg-brand-secondary-500/20 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 bg-linear-to-br from-slate-800 to-slate-900 rounded border border-white/10 flex items-center justify-center text-brand-secondary-500 shadow">
                <AlertTriangle className="size-12 text-red-500" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold uppercase tracking-tighter">
                Critical Failure
              </h1>
              <p className="text-slate-400">
                A top-level system error has occurred. We've been notified and
                are working on a fix.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 px-8 py-2 bg-brand-secondary-600 text-white rounded font-medium transition hover:bg-brand-secondary-500 active:scale-[0.98]"
              >
                <RefreshCw className="size-5" />
                Reset Application
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-2 bg-white/5 text-slate-300 rounded font-medium border border-white/10 transition hover:bg-white/10"
              >
                <Home className="size-5" />
                Back to Home
              </a>
            </div>

            <div className="pt-8 opacity-20">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em]">
                    System Debug: {error.digest || 'ROOT_LAYER_EXCEPTION'}
                </div>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
