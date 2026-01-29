import { useState } from "react";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useTitle } from "@/hooks/useTitle";
import { updateAdminProfile } from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminProfile() {
  useTitle("Admin Settings");
  const { admin } = useAdmin();
  const { addNotification } = useNotifications();

  const [username, setUsername] = useState(admin?.username || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      addNotification("Error", "Passwords do not match", "error");
      return;
    }

    try {
      setIsUpdating(true);
      await updateAdminProfile({
        username,
        email,
        password: password || undefined,
      });

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
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-sora mb-2">Admin Profile</h1>
          <p className="text-slate-400">
            Manage your account credentials and settings.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden">
          <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Account Information
              </h2>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="admin-username"
                    className="text-sm font-medium text-slate-400"
                  >
                    Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="admin-email"
                    className="text-sm font-medium text-slate-400"
                  >
                    Email Address
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                Change Password
              </h2>
              <p className="text-sm text-slate-500 italic">
                Leave blank if you don't want to change your password.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-medium text-slate-400"
                  >
                    New Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="admin-confirm-password"
                    className="text-sm font-medium text-slate-400"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="admin-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white font-semibold rounded transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
