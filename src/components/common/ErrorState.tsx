"use client";
import { AlertCircle, RefreshCcw, WifiOff } from "lucide-react";
import { m } from "motion/react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorState = ({
  message = "We're having trouble connecting to our servers. This might be a temporary issue.",
  onRetry,
  title = "Connection Issue",
}: ErrorStateProps) => {
  const isOffline = message.toLowerCase().includes("offline");

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
        <div className="relative p-4 bg-white dark:bg-slate-900 rounded border border-white/10 shadow shadow-brand-secondary-500/20">
          {isOffline ? (
            <WifiOff className="w-12 h-12 text-brand-secondary-500" />
          ) : (
            <AlertCircle className="w-12 h-12 text-red-500" />
          )}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {isOffline ? "You appear to be offline" : title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-2.5 bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white rounded font-bold transition-all hover:shadow hover:shadow-brand-secondary-500/30 active:scale-95 group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Try Again
        </button>
      )}
    </m.div>
  );
};
