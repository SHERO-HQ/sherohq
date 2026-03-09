"use client";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-xl mx-auto px-4 text-center">
        {/* 404 Number */}
        <div className="text-9xl font-bold font-sora bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent mb-4">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row sm:w-full items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded
                     bg-emerald-600 text-white font-semibold
                     hover:bg-emerald-700 transition-colors duration-300 cursor-pointer w-full"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded
                     border-2 border-slate-300 dark:border-slate-700
                     text-slate-700 dark:text-slate-300 font-semibold
                     hover:border-emerald-500 hover:text-emerald-600
                     transition-colors duration-300 cursor-pointer w-full"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
