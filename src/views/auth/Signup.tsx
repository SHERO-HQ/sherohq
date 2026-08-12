"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/queries/useAuthQuery";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const { mutateAsync: signupUser } = useRegister();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const passwordValue = watch("password") || "";

    const passwordRequirements = [
        { label: "8+ characters", met: passwordValue.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
        { label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
        { label: "One number", met: /\d/.test(passwordValue) },
    ];

    const onSubmit = async (data: SignupInput) => {
        setError("");

        try {
            await signupUser(data);
            router.push("/profile");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create account");
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
                            Create Account
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                            Join SHERO to manage your orders and projects
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
                            id="signup-name"
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            autoComplete="name"
                            leftIcon={<User className="w-5 h-5" />}
                            error={errors.name?.message}
                            {...register("name")}
                            size="lg"
                        />

                        <Input
                            id="signup-email"
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            autoComplete="email"
                            leftIcon={<Mail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register("email")}
                            size="lg"
                        />

                        <Input
                            id="signup-phone"
                            type="tel"
                            label="Phone Number"
                            placeholder="0244123456"
                            autoComplete="tel"
                            leftIcon={<Phone className="w-5 h-5" />}
                            error={errors.phone?.message}
                            {...register("phone")}
                            size="lg"
                        />

                        <div className="space-y-2">
                            <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                label="Password"
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

                            {/* Password requirements checklist */}
                            {passwordValue.length > 0 && (
                                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 animate-in fade-in duration-200">
                                    <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Password requirements:
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {passwordRequirements.map((req) => (
                                            <div
                                                key={req.label}
                                                className={`flex items-center gap-1.5 ${
                                                    req.met
                                                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                                        : "text-slate-400 dark:text-slate-500"
                                                }`}
                                            >
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                                                        req.met
                                                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-slate-200 dark:bg-slate-700 text-transparent"
                                                    }`}
                                                >
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                                <span>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            label="Confirm Password"
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
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Create Account <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 font-semibold hover:underline transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
