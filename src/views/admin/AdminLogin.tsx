"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import {
    Lock,
    User,
    AlertCircle,
    Loader2,
    Zap,
    Eye,
    EyeOff,
} from "lucide-react";
import { getSubdomain } from "@/utils/subdomain";
import AppImage from "@/components/common/AppImage";

export default function AdminLogin() {
    const { login, isAuthenticated, isLoading: isChecking } = useAdmin();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { requiresMFA, verifyMFA } = useAdmin();

    // Already authenticated on arrival (e.g. back button) — redirect silently
    useEffect(() => {
        if (!isChecking && isAuthenticated) {
            const subdomain = getSubdomain();
            const dashboardPath = subdomain === "admin" ? "/dashboard" : "/admin/dashboard";
            router.replace(dashboardPath);
        }
    }, [isChecking, isAuthenticated, router]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (requiresMFA) {
                await verifyMFA(mfaCode);
            } else {
                await login(username, password);
                // If login response has requiresMFA, AdminContext will set requiresMFA to true
                // and we will just stop here (isLoading false) to let user enter code
            }
            
            // Only redirect if authenticated
            // If requiresMFA became true, isAuthenticated is still false
        } catch (err: any) {
            if (err.message?.includes("Failed to fetch") || !err.status) {
                setError("Server unreachable. Please check your internet connection.");
            } else {
                setError(err instanceof Error ? err.message : "Login failed");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="dark min-h-screen bg-slate-950 flex items-center justify-center px-4">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img
                            src="/assets/logo/shero.svg"
                            alt="SHERO Logo"
                            width={60}
                            height={60}
                            fetchPriority="high"
                            decoding="async"
                            className="h-16 w-auto"
                            suppressHydrationWarning
                        />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">
                        SHERO TECHNOLOGIES
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Sign in to access the dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-card/50  border border-slate-800 rounded p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Step 1: Credentials */}
                        {!requiresMFA ? (
                            <>
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-sm font-medium text-muted-foreground mb-2"
                                    >
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-slate-700 rounded text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            required
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-muted-foreground mb-2"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full pl-10 pr-12 py-2 bg-muted/50 border border-slate-700 rounded text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            required
                                            autoComplete="current-password"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground focus:outline-none transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Step 2: MFA Code */
                            <div>
                                <label
                                    htmlFor="mfaCode"
                                    className="block text-sm font-medium text-muted-foreground mb-2"
                                >
                                    Authentication Code
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="mfaCode"
                                        type="text"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                        placeholder="Enter 6-digit code"
                                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-slate-700 rounded text-foreground text-center text-2xl tracking-[0.5em] placeholder:text-sm placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        required
                                        autoFocus
                                        autoComplete="one-time-code"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 text-center">
                                    Enter the code from your authenticator app to continue.
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mx-auto py-2 px-12 bg-linear-to-r from-purple-600 to-blue-600 text-foreground font-medium rounded hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {requiresMFA ? "Verifying..." : "Signing in..."}
                                </>
                            ) : (
                                requiresMFA ? "Verify Code" : "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800 ">
                        <p className="text-xs text-muted-foreground text-center inline-flex items-center gap-1 justify-center w-full">
                            {" "}
                            SHERO TECHNOLOGIES <Zap className="size-3" />{" "}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
