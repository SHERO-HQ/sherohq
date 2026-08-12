"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/queries/useAuthQuery";
import type { User } from "@/services/auth";
import { authFetch } from "@/services/api";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, KeyRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { mutateAsync: login } = useLogin();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [mfaChallenge, setMfaChallenge] = useState<{
    token: string;
    user: User;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [verifyingMFA, setVerifyingMFA] = useState(false);

  const onSubmit = async (data: LoginInput) => {
    setError("");

    try {
      const res = await login(data);
      if (res.requiresMFA) {
        if (!res.mfaToken) {
          throw new Error("MFA token missing from response");
        }

        setMfaChallenge({ token: res.mfaToken, user: res.user });
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  const onVerifyMFA = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const targetCode = (typeof codeOverride === "string" ? codeOverride : mfaCode).trim();
    if (targetCode.length !== 6 || verifyingMFA) return;

    setVerifyingMFA(true);
    setError("");

    try {
      const res = await authFetch("/api/auth/login/mfa", {
        method: "POST",
        body: JSON.stringify({ mfaToken: mfaChallenge?.token, code: targetCode }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = "/profile"; // Hard refresh to update auth state
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch {
      setError("Failed to verify code");
    } finally {
      setVerifyingMFA(false);
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
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {mfaChallenge ? "Verify Your Identity" : "Welcome Back"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {mfaChallenge
                ? "Enter the 6-digit code from your authenticator app"
                : "Sign in to access your account and orders"}
            </p>
          </div>

          {mfaChallenge ? (
            <form onSubmit={onVerifyMFA} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  id="mfa-code"
                  label="Verification Code"
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={mfaCode}
                  leftIcon={<KeyRound className="w-5 h-5" />}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setMfaCode(val);
                    if (val.length === 6) {
                      onVerifyMFA(undefined, val);
                    }
                  }}
                  autoFocus
                  className="text-center text-2xl tracking-[0.4em] font-mono font-semibold placeholder:text-2xl placeholder:tracking-[0.4em] placeholder:font-mono placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  size="lg"
                />

                <Button
                  type="submit"
                  variant="brand"
                  disabled={verifyingMFA || mfaCode.length !== 6}
                  className="w-full font-semibold shadow-sm"
                  size="lg"
                >
                  {verifyingMFA ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Verify & Sign In <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaChallenge(null);
                    setMfaCode("");
                    setError("");
                  }}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                >
                  Cancel and use different account
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  id="login-email"
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register("email")}
                  size="lg"
                />

                <div className="space-y-1.5">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                  <div className="flex justify-end pt-0.5">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-medium hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

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
                      Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline transition-colors"
                >
                  Create one
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
