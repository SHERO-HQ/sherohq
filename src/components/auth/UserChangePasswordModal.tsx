"use client";
import React, { useState } from "react";
import { Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function UserChangePasswordModal() {
 const { mustReset, changePassword } = useAuth();
 const { addNotification } = useNotifications();
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 if (!mustReset) return null;

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setError(null);

 if (password.length < 8) {
 setError("Password must be at least 8 characters long.");
 return;
 }

 if (password !== confirmPassword) {
 setError("Passwords do not match.");
 return;
 }

 setIsSubmitting(true);
 try {
 await changePassword(password);
 addNotification(
 "Password Updated",
 "Your password has been changed successfully.",
 "success",
 );
 } catch (err) {
 setError(
 err instanceof Error ? err.message : "Failed to update password",
 );
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
 <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 rounded">
 <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-emerald-500/10 rounded">
 <ShieldCheck className="w-6 h-6 text-emerald-500" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-white">
 Security Update Required
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Please change your password to protect your account.
 </p>
 </div>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 {error && (
 <div className="flex items-center gap-2 p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-4">
 <div className="space-y-1.5">
 <label
 htmlFor="user-new-password"
 className="text-xs font-medium text-slate-500 dark:text-slate-400"
 >
 New Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input
 id="user-new-password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-slate-900 dark:text-white"
 placeholder="At least 8 characters"
 required
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label
 htmlFor="user-confirm-password"
 className="text-xs font-medium text-slate-500 dark:text-slate-400"
 >
 Confirm Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input
 id="user-confirm-password"
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-slate-900 dark:text-white"
 placeholder="Confirm your new password"
 required
 />
 </div>
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className={cn(
 "w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 rounded shadow-lg shadow-emerald-600/20",
 isSubmitting && "opacity-70 cursor-not-allowed",
 )}
 >
 {isSubmitting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Updating Password...
 </>
 ) : (
 "Update Password & Continue"
 )}
 </button>
 </form>
 </div>
 </div>
 );
}
