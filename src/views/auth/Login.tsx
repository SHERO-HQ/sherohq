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

 const onSubmit = async (data: LoginInput) => {
 setError("");

 try {
 await login(data);
 router.push("/profile");
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Failed to login");
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
 Welcome Back
 </h1>
 <p className="text-slate-500 dark:text-slate-400 mt-2">
 Sign in to your account
 </p>
 </div>

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
 className="text-emerald-600! dark:text-emerald-400 font-semibold hover:underline"
 >
 Sign up
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
};

export default Login;
