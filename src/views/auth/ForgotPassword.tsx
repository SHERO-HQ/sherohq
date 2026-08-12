"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { requestPasswordReset } from "@/services/auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");
    try {
      const res = await requestPasswordReset(data.email);
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setError(res.message || "Failed to send reset link");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="py-6 sm:py-10 flex justify-center px-4">
      <div className="w-full max-w-md">
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 pattern-dots mask-radial-faded" />
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all">
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="w-8 h-8 text-brand-secondary-600 dark:text-brand-secondary-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Forgot Password?
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  id="forgot-email"
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register("email")}
                  size="lg"
                />

                <Button
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting}
                  className="w-full font-semibold shadow-sm mt-1"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Link...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Reset Link <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
