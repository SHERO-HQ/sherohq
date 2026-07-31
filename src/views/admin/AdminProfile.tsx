"use client";
import { useState, useRef } from "react";
import { User, Save, Loader2, Shield, Camera, AlertCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { updateAdminProfile, uploadImage, getImageUrl } from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";
import { MFASetupDialog } from "@/components/admin/MFASetupDialog";
import { } from "@/services/admin";
import { useDialog } from "@/hooks/useDialog";

export default function AdminProfile() {
  const { admin, setAdmin } = useAdmin();
  const { addNotification } = useNotifications();
  const dialog = useDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username] = useState(admin?.username || "");
  const [email] = useState(admin?.email || "");
  const [phone, setPhone] = useState(admin?.phone || "");
  const [avatar, setAvatar] = useState(admin?.avatar || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      const { imageUrl } = await uploadImage(file);
      setAvatar(imageUrl);
      addNotification(
        "Success",
        "Avatar uploaded temporarily. Save profile to apply changes.",
        "success",
      );
    } catch (err: unknown) {
      addNotification(
        "Error",
        err instanceof Error ? err.message : "Failed to upload avatar",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUpdateProfile(e: React.BaseSyntheticEvent) {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      addNotification("Error", "Passwords do not match", "error");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await updateAdminProfile({
        phone: phone || undefined,
        password: password || undefined,
        avatar: avatar || undefined});

      setAdmin(res.user);
      addNotification("Success", "Profile updated successfully", "success");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      addNotification(
        "Error",
        err instanceof Error ? err.message : "Failed to update profile",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDisableMFA() {
    const shouldDisable = await dialog.confirm({
      title: "Disable Multi-Factor Authentication?",
      message:
        "Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure.",
      confirmText: "Disable MFA",
      cancelText: "Keep MFA",
      type: "warning"});

    if (!shouldDisable) {
      return;
    }

    try {
      setIsUpdating(true);
      // For now, I'll just show a notification.
      addNotification(
        "Info",
        "MFA disabling requires a separate verification step for security. Please contact a superadmin.",
        "info",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your administrative profile and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border overflow-hidden">
            <div className="h-24 bg-linear-to-br from-brand-secondary-600 to-blue-600" />
            <div className="px-6 pb-6 relative">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="relative group">
                  <div className="relative w-24 h-24 rounded bg-background border-4 border-card overflow-hidden shadow">
                    {avatar ? (
                      <AppImage
                        src={getImageUrl(avatar)}
                        alt={admin?.username ?? "Admin avatar"}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <User className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-1.5 bg-brand-secondary-500 rounded text-white hover:bg-brand-secondary-400 transition-colors shadow"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold capitalize text-foreground">
                  {username || "Admin"}
                </h2>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {admin?.role || "Super Administrator"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-brand-secondary-500/5 border-brand-secondary-500/10 p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-brand-secondary-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-brand-secondary-400">
                  Security Tip
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep your password alphanumeric for better security.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <form
              onSubmit={handleUpdateProfile}
              className="p-6 md:p-8 space-y-8"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Username
                    </label>
                    <Input
                      id="username"
                      value={username}
                      readOnly
                      className="bg-muted/30 border-border text-muted-foreground cursor-not-allowed focus:ring-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      value={email}
                      readOnly
                      className="bg-muted/30 border-border text-muted-foreground cursor-not-allowed focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="02XXXXXXXX"
                  />
                </div>

                <div className="p-4 rounded bg-muted/30 border border-border space-y-6">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Keep blank to maintain
                    current password
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="new-password"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        New Password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted/50 border-border text-foreground"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="confirm-password"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Confirm New Password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-muted/50 border-border text-foreground"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-35"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* MFA Section */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-secondary-400" />
                    Two-Factor Authentication (MFA)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                    admin?.mfaEnabled
                      ? "bg-brand-secondary-500/10 text-brand-secondary-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {admin?.mfaEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>

              {!admin?.mfaEnabled ? (
                <div className="p-6 rounded bg-card/50 border border-border space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-secondary-500/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-brand-secondary-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Protect your account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MFA adds a second step to your login process by
                        requiring a code from an authenticator app.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-brand-secondary-500/20 hover:bg-brand-secondary-500/10 text-brand-secondary-400"
                    onClick={() => setShowMFASetup(true)}
                  >
                    Setup Two-Factor Authentication
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded bg-brand-secondary-500/5 border border-brand-secondary-500/10 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-secondary-500/20 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-brand-secondary-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        MFA is active
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your account is protected with two-factor
                        authentication.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                    onClick={handleDisableMFA}
                  >
                    Disable
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showMFASetup && (
        <MFASetupDialog
          onSuccess={() => {
            setShowMFASetup(false);
            setAdmin({ ...admin!, mfaEnabled: true });
            addNotification("Success", "MFA enabled successfully", "success");
          }}
          onCancel={() => setShowMFASetup(false)}
        />
      )}
    </div>
  );
}

function Card({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded border bg-slate-950", className)} {...props}>
      {children}
    </div>
  );
}
