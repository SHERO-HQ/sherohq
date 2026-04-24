"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
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
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Invalid Link
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline"
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
          <div className="w-20 h-20 mx-auto bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-brand-secondary-600 dark:text-brand-secondary-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your password has been updated. Redirecting you to login...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline"
          >
            Go to Login now
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded text-center">
                {error}
              </div>
            )}

            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register("password")}
              size="xl"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />

            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              label="Confirm New Password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              size="xl"
            />

            <Button
              type="submit"
              variant="brand"
              disabled={isSubmitting}
              className="w-full font-bold"
              size="xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">Resetting Password...</span>
              ) : (
                <>
                  Reset Password <ArrowRight className="w-5 h-5" />
                </>
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
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-brand-secondary-600 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Loading reset form...</p>
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
