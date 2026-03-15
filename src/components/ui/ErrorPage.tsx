"use client";

/**
 * Reusable error UI used by all route-segment error.tsx files.
 */
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
 error: Error & { digest?: string };
 reset: () => void;
 /** Show a back-to link. Defaults to home. */
 homePath?: string;
 homeLabel?: string;
}

export default function ErrorPage({
 error,
 reset,
 homePath = "/",
 homeLabel = "Go Home",
}: ErrorPageProps) {
 useEffect(() => {
 if (process.env.NODE_ENV === "production") {
 // e.g. Sentry.captureException(error);
 }
 }, [error]);

 return (
 <div className="min-h-[60vh] flex items-center justify-center p-8">
 <div className="text-center max-w-md">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
 <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
 </div>

 <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
 Something went wrong
 </h2>
 <p className="text-slate-600 dark:text-slate-400 mb-6">
 An unexpected error occurred. Please try again or return to the home
 page.
 </p>

 {process.env.NODE_ENV === "development" && (
 <details className="mb-6 text-left">
 <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
 Error details
 </summary>
 <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-red-600 dark:text-red-400 overflow-auto">
 {error.message}
 {error.digest && `\nDigest: ${error.digest}`}
 </pre>
 </details>
 )}

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <button
 onClick={reset}
 className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors"
 >
 <RefreshCw className="w-4 h-4" />
 Try Again
 </button>
 <a
 href={homePath}
 className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
 >
 <Home className="w-4 h-4" />
 {homeLabel}
 </a>
 </div>
 </div>
 </div>
 );
}
