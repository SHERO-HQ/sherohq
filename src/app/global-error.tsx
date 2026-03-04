"use client";

/**
 * global-error.tsx — catches errors thrown in the root layout itself.
 * Must include its own <html> and <body> since the root layout is bypassed.
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // e.g. Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-6">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-6">
            A critical error occurred. Our team has been notified.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mb-6 p-3 bg-slate-900 rounded text-xs text-red-400 text-left overflow-auto">
              {error.message}
            </pre>
          )}
          <button
            onClick={reset}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
