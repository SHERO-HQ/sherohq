"use client";
import React, { useState } from "react";
import { Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { adminChangePassword } from "@/services/api";
import { useAdmin } from "@/context/AdminContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function ChangePasswordModal() {
  const { mustReset, setMustReset } = useAdmin();
  const { addNotification } = useNotifications();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mustReset) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminChangePassword(currentPassword, password);
      addNotification(
        "Password Updated",
        "Your password has been changed successfully.",
        "success",
      );
      setMustReset(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-card/80  animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-card border border-border dark:border-border shadow overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-border dark:border-border bg-slate-50 dark:bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-foreground">
                Security Update Required
              </h2>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Please change your password to continue.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="current-password"
                className="text-xs font-medium text-muted-foreground dark:text-muted-foreground"
              >
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-accent/50 border border-border dark:border-border focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 transition text-slate-900 dark:text-foreground"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-xs font-medium text-muted-foreground dark:text-muted-foreground"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-accent/50 border border-border dark:border-border focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 transition text-slate-900 dark:text-foreground"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-xs font-medium text-muted-foreground dark:text-muted-foreground"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-accent/50 border border-border dark:border-border focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50 transition text-slate-900 dark:text-foreground"
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
              "w-full py-2.5 px-4 bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-semibold text-sm transition flex items-center justify-center gap-2",
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
