"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { register: signupUser } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
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
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Background with glow orbs */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10">
                    {/* Glow orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                    {/* Particles */}
                    <div className="absolute inset-0 pattern-dots mask-radial-faded" />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8">
                    <div className="text-center mb-8">
                        <Image
                            src="/assets/logo/shero.svg"
                            alt="Shero"
                            width={48}
                            height={48}
                            className="h-12 w-auto mx-auto mb-4"
                            priority
                        />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Create Account
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Join SHERO today
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded text-center">
                                {error}
                            </div>
                        )}

                        <Input
                            id="signup-name"
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            leftIcon={<User className="w-5 h-5" />}
                            error={errors.name?.message}
                            {...register("name")}
                            size="xl"
                        />

                        <Input
                            id="signup-email"
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            leftIcon={<Mail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register("email")}
                            size="xl"
                        />

                        <Input
                            id="signup-phone"
                            type="tel"
                            label="Phone Number"
                            placeholder="0244123456"
                            leftIcon={<Phone className="w-5 h-5" />}
                            error={errors.phone?.message}
                            {...register("phone")}
                            size="xl"
                        />

                        <Input
                            id="signup-password"
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
                                    className="focus:outline-none transition-colors flex items-center"
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
                            id="signup-confirm-password"
                            type={showPassword ? "text" : "password"}
                            label="Confirm Password"
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
                            className="w-full font-bold mt-6"
                            size="xl"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    Creating Account...
                                </span>
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-brand-secondary-600! dark:text-brand-secondary-400 font-semibold hover:underline"
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
