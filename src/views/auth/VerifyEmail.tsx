"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/services/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
 const searchParams = useSearchParams();
 const token = searchParams.get("token");
 const hasAttemptedVerification = useRef(false);

 // Initialize status based on token presence
 const [status, setStatus] = useState<"loading" | "success" | "error">(
 token ? "loading" : "error",
 );
 const [message, setMessage] = useState(
 token ? "" : "No verification token provided.",
 );

 useEffect(() => {
 // Skip if no token or if we've already attempted verification
 if (!token || hasAttemptedVerification.current) {
 return;
 }

 hasAttemptedVerification.current = true;

 verifyEmail(token)
 .then(() => {
 setStatus("success");
 setMessage("Your email has been verified successfully!");
 })
 .catch((err) => {
 setStatus("error");
 setMessage(err.message || "Verification failed. Please try again.");
 });
 }, [token]);

 return (
    <div className="py-6 sm:py-10 flex justify-center px-4">
      <div className="w-full max-w-md">
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 pattern-dots mask-radial-faded" />
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-center transition-all">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-brand-secondary-600 animate-spin mb-5" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Verifying Email...
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="w-8 h-8 text-brand-secondary-600 dark:text-brand-secondary-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {message}
              </p>
              <Link
                href="/profile"
                className="inline-block px-6 py-2.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-semibold rounded shadow-sm transition-colors text-sm"
              >
                Go to Profile
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mb-5">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {message}
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-semibold rounded shadow-sm transition-colors text-sm"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
 );
};

export default VerifyEmail;
