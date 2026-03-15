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
 <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
 <div className="w-full max-w-md">
 <div className="bg-white dark:bg-slate-900 rounded shadow-md border border-slate-200 dark:border-slate-800 p-8 text-center">
 {status === "loading" && (
 <>
 <Loader2 className="w-16 h-16 mx-auto text-emerald-600 animate-spin mb-6" />
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
 Verifying Email...
 </h1>
 <p className="text-slate-500 dark:text-slate-400">
 Please wait while we verify your email address.
 </p>
 </>
 )}

 {status === "success" && (
 <>
 <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
 <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
 </div>
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
 Email Verified!
 </h1>
 <p className="text-slate-500 dark:text-slate-400 mb-8">
 {message}
 </p>
 <Link
 href="/profile"
 className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
 >
 Go to Profile
 </Link>
 </>
 )}

 {status === "error" && (
 <>
 <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
 <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
 </div>
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
 Verification Failed
 </h1>
 <p className="text-slate-500 dark:text-slate-400 mb-8">
 {message}
 </p>
 <Link
 href="/login"
 className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
 >
 Go to Login
 </Link>
 </>
 )}
 </div>
 </div>
 </div>
 );
};

export default VerifyEmail;
