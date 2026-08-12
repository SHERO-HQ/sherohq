"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, ArrowRight, CheckCircle, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { resetPassword } from "@/services/auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;
    setError("");
    try {
      const res = await resetPassword(token, data.password);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Invalid Link
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      {isSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-8 h-8 text-brand-secondary-600 dark:text-brand-secondary-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your password has been securely updated. Redirecting to login...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline"
          >
            Go to Login Now
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reset Your Password
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Please enter your new password below.
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
              id="reset-password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="••••••••"
              autoComplete="new-password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register("password")}
              size="lg"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="focus:outline-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm New Password"
              placeholder="••••••••"
              autoComplete="new-password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              size="lg"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="focus:outline-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              variant="brand"
              disabled={isSubmitting}
              className="w-full font-semibold shadow-sm mt-2"
              size="lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting Password...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Reset Password <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </>
      )}
    </>
  );
};

const ResetPassword = () => {
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
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-brand-secondary-600 animate-spin mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading reset form...</p>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
