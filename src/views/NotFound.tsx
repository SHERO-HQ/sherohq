 "use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      {/* Particles dots background */}
      <div className="absolute inset-0 pattern-dots mask-radial-faded pointer-events-none" />

      <div className="container max-w-xl mx-auto text-center relative z-10">
        {/* 404 Number */}
        <div className="text-8xl sm:text-9xl tracking-tighter font-bold bg-linear-to-r from-brand-secondary-500 to-blue-500 bg-clip-text text-transparent mb-4 select-none">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Sorry, the page you&apos;re looking for doesn&apos;t exist, has been removed, or has moved to a new address.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto relative z-20">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-medium transition-colors duration-200 cursor-pointer w-full sm:w-1/2 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors duration-200 cursor-pointer w-full sm:w-1/2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
