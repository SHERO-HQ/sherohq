"use client";
import { useState, useRef } from "react";
import { User, Save, Loader2, Shield, Camera, AlertCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useTitle } from "@/hooks/useTitle";
import { updateAdminProfile, uploadImage, getImageUrl } from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ProductImage from "@/components/common/ProductImage";

export default function AdminProfile() {
  useTitle("Admin Settings");
  const { admin, setAdmin } = useAdmin();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username] = useState(admin?.username || "");
  const [email] = useState(admin?.email || "");
  const [phone, setPhone] = useState(admin?.phone || "");
  const [avatar, setAvatar] = useState(admin?.avatar || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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
      // Username and Email are read-only and not sent
      const res = await updateAdminProfile({
        phone: phone || undefined,
        password: password || undefined,
        avatar: avatar || undefined,
      });

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

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white font-sora">
            Account Settings
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your administrative profile and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border overflow-hidden">
              <div className="h-24 bg-linear-to-br from-emerald-600 to-blue-600" />
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative group">
                    <div className="relative w-24 h-24 rounded bg-background border-4 border-card overflow-hidden shadow-2xl">
                      {avatar ? (
                        <ProductImage
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
                      className="absolute bottom-1 right-1 p-1.5 bg-emerald-500 rounded text-white hover:bg-emerald-400 transition-colors shadow-lg"
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
                  <h2 className="text-xl font-bold font-sora capitalize text-white">
                    {username || "Admin"}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                    {admin?.role || "Super Administrator"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/10 p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 font-sora">
                    Security Tip
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
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
                        className="text-sm font-medium text-slate-400"
                      >
                        Username
                      </label>
                      <Input
                        id="username"
                        value={username}
                        readOnly
                        className="bg-muted/30 border-border text-slate-500 cursor-not-allowed focus:ring-0"
                        title="Contact Super Admin to change username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-400"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        value={email}
                        readOnly
                        className="bg-muted/30 border-border text-slate-500 cursor-not-allowed focus:ring-0"
                        title="Contact Super Admin to change email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-slate-400"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-muted/50 border-border text-foreground focus:ring-emerald-500/20"
                      placeholder="02XXXXXXXX"
                    />
                  </div>

                  <div className="p-4 rounded bg-muted/30 border border-border space-y-6">
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Keep blank to maintain
                      current password
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="new-password"
                          className="text-sm font-medium text-slate-400"
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
                          className="text-sm font-medium text-slate-400"
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
                    type="button"
                    variant="ghost"
                    className="text-slate-400  hover:text-white"
                    onClick={() => {
                      setPhone(admin?.phone || "");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
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
          </div>
        </div>
      </div>
    </AdminLayout>
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
