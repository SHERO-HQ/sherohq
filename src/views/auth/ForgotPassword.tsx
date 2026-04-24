"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8">
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-brand-secondary-600 dark:text-brand-secondary-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Forgot Password?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  No worries! Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded text-center">
                    {error}
                  </div>
                )}

                <Input
                  id="forgot-email"
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register("email")}
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
                    <span className="flex items-center gap-2">Sending Link...</span>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors hover:underline"
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
