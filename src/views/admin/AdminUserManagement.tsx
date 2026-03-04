"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Trash2,
  UserCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  KeyRound,
  Ban,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import {
  useAdminUsers,
  useRegisterAdminUser,
  useUpdateAdminUserRole,
  useDeleteAdminUser,
  useResetStaffPassword,
  useToggleStaffActive,
} from "@/hooks/queries/useAdminUsers";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleConfig: Record<
  string,
  { label: string; icon: LucideIcon; color: string; bgColor: string }
> = {
  superadmin: {
    label: "Super Admin",
    icon: ShieldAlert,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  admin: {
    label: "Administrator",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  manager: {
    label: "Manager",
    icon: Shield,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  attendant: {
    label: "Attendant",
    icon: UserCheck,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  clerk: {
    label: "Clerk",
    icon: UserCog,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
  },
};

export default function AdminUserManagement() {
  const { admin: currentAdmin } = useAdmin();
  const { data, isLoading } = useAdminUsers();
  const registerMutation = useRegisterAdminUser();
  const updateRoleMutation = useUpdateAdminUserRole();
  const deleteMutation = useDeleteAdminUser();
  const resetPasswordMutation = useResetStaffPassword();
  const toggleActiveMutation = useToggleStaffActive();
  const { addNotification } = useNotifications();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "clerk",
  });

  const admins = React.useMemo(() => data?.users || [], [data]);

  const filteredAdmins = admins.filter(
    (a) =>
      (a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter === "all" || a.role === roleFilter),
  );

  const canManageRoles =
    currentAdmin?.role === "superadmin" || currentAdmin?.role === "admin";
  const isSuperAdmin = currentAdmin?.role === "superadmin";

  const handleRegister = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(formData);
      addNotification("Success", "Admin user created successfully", "success");
      setIsRegisterModalOpen(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        phone: "",
        role: "clerk",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create admin user";
      addNotification("Error", message, "error");
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role });
      addNotification("Success", "Role updated successfully", "success");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update role";
      addNotification("Error", message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addNotification("Success", "Admin user deleted successfully", "success");
      setDeleteId(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete admin user";
      addNotification("Error", message, "error");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId) return;
    try {
      const result = await resetPasswordMutation.mutateAsync(resetPasswordId);
      addNotification(
        "Password Reset",
        result.message ||
          "Staff member will be prompted to set a new password on next login.",
        "success",
      );
      setResetPasswordId(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      addNotification("Error", message, "error");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({ userId, isActive });
      addNotification(
        "Account Updated",
        isActive
          ? "Account reactivated."
          : "Account deactivated and sessions revoked.",
        "success",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update account status";
      addNotification("Error", message, "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sora">
              Admin Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage system access and roles for your team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManageRoles && (
              <Button
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/40 border-white/10 text-white placeholder:text-slate-600 focus:ring-emerald-500/20"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 appearance-none min-w-35"
          >
            <option value="all">All Roles</option>
            {Object.entries(roleConfig).map(([role, cfg]) => (
              <option key={role} value={role}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading &&
            ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((id) => (
              <div
                key={id}
                className="h-48 rounded bg-slate-900/40 border border-white/5 animate-pulse"
              />
            ))}

          {!isLoading && filteredAdmins.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-900/20 rounded border border-white/5 border-dashed">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No admin users found</p>
            </div>
          )}

          {!isLoading &&
            filteredAdmins.length > 0 &&
            filteredAdmins.map((user) => {
              const config = roleConfig[user.role] || roleConfig.clerk;
              const RoleIcon = config.icon;

              return (
                <div
                  key={user.id}
                  className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded p-6 hover:border-emerald-500/30 transition-all duration-500"
                >
                  <div className="absolute top-4 right-4 ring-offset-slate-950">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-slate-900 border-white/10 text-slate-300"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5" />
                        {canManageRoles && user.id !== currentAdmin?.id && (
                          <>
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-500 py-1">
                              Change Role
                            </DropdownMenuLabel>
                            {Object.entries(roleConfig).map(([role, cfg]) => {
                              // Restriction: Only superadmin can assign superadmin
                              if (role === "superadmin" && !isSuperAdmin)
                                return null;
                              // Restriction: Only superadmin can modify superadmins
                              if (user.role === "superadmin" && !isSuperAdmin)
                                return null;

                              return (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() =>
                                    handleUpdateRole(user.id, role)
                                  }
                                  className={cn(
                                    "flex items-center gap-2 cursor-pointer hover:bg-white/5",
                                    user.role === role &&
                                      "text-emerald-400 bg-emerald-500/5",
                                  )}
                                >
                                  <cfg.icon
                                    className={cn("w-3.5 h-3.5", cfg.color)}
                                  />
                                  {cfg.label}
                                </DropdownMenuItem>
                              );
                            })}
                            <DropdownMenuSeparator className="bg-white/5" />
                            {/* Reset password — admin and above */}
                            <DropdownMenuItem
                              onClick={() => setResetPasswordId(user.id)}
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                            >
                              <KeyRound className="w-4 h-4 mr-2" />
                              Force Password Reset
                            </DropdownMenuItem>
                            {/* Deactivate / Reactivate — superadmin only */}
                            {isSuperAdmin && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleActive(user.id, !user.isActive)
                                }
                                className={cn(
                                  "cursor-pointer",
                                  user.isActive !== false
                                    ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                    : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10",
                                )}
                              >
                                {user.isActive !== false ? (
                                  <>
                                    <Ban className="w-4 h-4 mr-2" /> Deactivate
                                    Account
                                  </>
                                ) : (
                                  <>
                                    <CircleCheck className="w-4 h-4 mr-2" />{" "}
                                    Reactivate Account
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            {isSuperAdmin && (
                              <DropdownMenuItem
                                onClick={() => setDeleteId(user.id)}
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer hover:bg-white/5"
                        >
                          <a href={`mailto:${user.email}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email User
                          </a>
                        </DropdownMenuItem>
                        {user.phone && (
                          <DropdownMenuItem
                            asChild
                            className="cursor-pointer hover:bg-white/5"
                          >
                            <a href={`tel:${user.phone}`}>
                              <Phone className="w-4 h-4 mr-2" />
                              Call User
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded bg-slate-800 flex items-center justify-center text-xl font-bold text-white overflow-hidden border border-white/5 shadow-inner">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 p-1 rounded border border-slate-950",
                          config.bgColor,
                        )}
                      >
                        <RoleIcon className={cn("w-3 h-3", config.color)} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white truncate font-sora tracking-tight">
                          {user.username}
                        </h3>
                        {user.isActive === false && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
                            <Ban className="w-2.5 h-2.5" /> Inactive
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${user.email}`}
                        className="text-xs text-slate-500 hover:text-emerald-400 transition-colors truncate mb-1 block"
                      >
                        {user.email}
                      </a>
                      {user.phone && (
                        <a
                          href={`tel:${user.phone}`}
                          className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors truncate flex items-center gap-1 mb-2"
                        >
                          <Phone className="w-3 h-3 text-slate-600" />
                          {user.phone}
                        </a>
                      )}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold border-transparent uppercase tracking-wider",
                          config.bgColor,
                          config.color,
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium uppercase tracking-tight">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    {user.id === currentAdmin?.id && (
                      <div className="flex justify-end">
                        <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 border-none text-[9px]">
                          YOU
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Register Modal */}
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title="Create New Admin User"
        >
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reg-username" className="text-slate-400">
                Username
              </Label>
              <Input
                id="reg-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                placeholder="e.g. john_doe"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-700 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-slate-400">
                Email Address
              </Label>
              <Input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="john@example.com"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-700 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone" className="text-slate-400">
                Phone Number (Optional)
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="02XXXXXXXX or 05XXXXXXXX"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-700 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-slate-400">
                Temporary Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-700 focus:ring-emerald-500/20"
              />
              <p className="text-[10px] text-slate-500">
                Min 8 characters — requires uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-role" className="text-slate-400">
                Assigned Role
              </Label>
              <select
                id="reg-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 appearance-none"
              >
                {Object.entries(roleConfig).map(([role, cfg]) => {
                  if (role === "superadmin" && !isSuperAdmin) return null;
                  return (
                    <option key={role} value={role}>
                      {cfg.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-30"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Archive Admin Access"
          message="Are you sure you want to remove this administrator? This action is recorded in the activity log."
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          confirmText="Deactivate Access"
          variant="danger"
        />

        {/* Reset Password Dialog */}
        <ConfirmDialog
          isOpen={!!resetPasswordId}
          title="Force Password Reset"
          message="This staff member will be logged out immediately and required to set a new password on their next login."
          onConfirm={handleResetPassword}
          onClose={() => setResetPasswordId(null)}
          confirmText="Reset Password"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
}
