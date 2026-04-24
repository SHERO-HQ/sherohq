"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState("");
 const { login } = useAuth();
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

  const [mfaChallenge, setMfaChallenge] = useState<{ token: string; user: any } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [verifyingMFA, setVerifyingMFA] = useState(false);

  const onSubmit = async (data: LoginInput) => {
    setError("");

    try {
      const res = await login(data);
      if (res.requiresMFA) {
        setMfaChallenge({ token: res.mfaToken, user: res.user });
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  const onVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) return;
    
    setVerifyingMFA(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/login/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken: mfaChallenge?.token, code: mfaCode }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Log in the user in the context
        if (data.token) {
          localStorage.setItem("userToken", data.token);
        }
        window.location.href = "/profile"; // Hard refresh to update auth state
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (err) {
      setError("Failed to verify code");
    } finally {
      setVerifyingMFA(false);
    }
  };

 return (
 <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 dark:bg-slate-950">
 <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <img
              src="/assets/logo/shero.svg"
              alt="Shero"
              width={48}
              height={48}
              className="h-12 w-auto mx-auto mb-4"
              suppressHydrationWarning
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mfaChallenge ? "Verify It's You" : "Welcome Back"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {mfaChallenge
                ? "Enter the 6-digit code from your authenticator app"
                : "Sign in to your account"}
            </p>
          </div>

          {mfaChallenge ? (
            <form onSubmit={onVerifyMFA} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  id="mfa-code"
                  label="Verification Code"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  size="xl"
                />

                <Button
                  type="submit"
                  variant="brand"
                  disabled={verifyingMFA || mfaCode.length !== 6}
                  className="w-full font-bold"
                  size="xl"
                >
                  {verifyingMFA ? (
                    <span className="flex items-center gap-2">Verifying...</span>
                  ) : (
                    <>
                      Verify & Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setMfaChallenge(null)}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Cancel and use different account
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded text-center">
                    {error}
                  </div>
                )}

                <Input
                  id="login-email"
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register("email")}
                  size="xl"
                />

                <div className="space-y-1">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
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
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-medium hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting}
                  className="w-full font-bold"
                  size="xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">Signing In...</span>
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-brand-secondary-600! dark:text-brand-secondary-400 font-semibold hover:underline"
                >
                  Sign up
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
