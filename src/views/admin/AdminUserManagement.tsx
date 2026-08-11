"use client";

import React from "react";
import {
  Users,
  Plus,
  Search,
  UserCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminUserCard } from "@/components/admin/users/AdminUserCard";
import { RegisterAdminModal } from "@/components/admin/users/RegisterAdminModal";
import { useAdminUserManagement } from "@/components/admin/users/useAdminUserManagement";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
    color: "text-brand-secondary-400",
    bgColor: "bg-brand-secondary-500/10",
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
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

const AdminUserManagementSkeleton = () => (
  <>
    {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((id) => (
      <div
        key={id}
        className="relative bg-card/40 border border-border rounded p-6 animate-pulse select-none"
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded bg-accent/50 border border-border shrink-0" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-accent border border-slate-950" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-28 bg-accent rounded" />
            <div className="h-3 w-40 bg-accent/50 rounded" />
            <div className="h-3 w-32 bg-accent/50 rounded" />
            <div className="h-5 w-24 bg-accent/50 rounded-full mt-2" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="h-3 w-20 bg-accent/50 rounded" />
          <div className="h-3.5 w-8 bg-accent/50 rounded" />
        </div>
      </div>
    ))}
  </>
);

export default function AdminUserManagement() {
  const {
    currentAdmin,
    isLoading,
    registerMutation,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    deleteId,
    setDeleteId,
    resetPasswordId,
    setResetPasswordId,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    formData,
    setFormData,
    filteredAdmins,
    canManageRoles,
    isSuperAdmin,
    handleRegister,
    handleUpdateRole,
    handleDelete,
    handleResetPassword,
    handleToggleActive,
  } = useAdminUserManagement();

  return (
    <div className="space-y-6">
      {/* Header & Filters Sticky Bar */}
      <div className="sticky top-20 z-20 bg-background/95 backdrop-blur-md py-3 pb-4 -mx-3 px-3 md:-mx-6 md:px-6 border-b border-border/50 shadow-xs rounded-b mb-6">
        <AdminPageHeader
          icon={ShieldCheck}
          title="Staff & Role Management"
          description="Manage system access and roles for your team."
        >
          {canManageRoles && (
            <Button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground shadow shadow-brand-secondary-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin User
            </Button>
          )}
        </AdminPageHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/40 border-border text-foreground placeholder:text-slate-600 focus:ring-brand-secondary-500/20"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-card border border-border rounded px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500/20 appearance-none min-w-35"
          >
            <option value="all">All Roles</option>
            {Object.entries(roleConfig).map(([role, cfg]) => (
              <option key={role} value={role}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && <AdminUserManagementSkeleton />}

        {!isLoading && filteredAdmins.length === 0 && (
          <div className="col-span-full py-20 text-center bg-card/20 rounded border border-border border-dashed">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No admin users found
            </p>
          </div>
        )}

        {!isLoading &&
          filteredAdmins.length > 0 &&
          filteredAdmins.map((user) => (
            <AdminUserCard
              key={user.id}
              user={user}
              roleConfig={roleConfig}
              currentAdminId={currentAdmin?.id}
              canManageRoles={canManageRoles}
              isSuperAdmin={isSuperAdmin}
              onUpdateRole={handleUpdateRole}
              onSetResetPasswordId={setResetPasswordId}
              onToggleActive={handleToggleActive}
              onSetDeleteId={setDeleteId}
            />
          ))}
      </div>

      {/* Register Modal */}
      <RegisterAdminModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleRegister={handleRegister}
        isPending={registerMutation.isPending}
        roleConfig={roleConfig}
        isSuperAdmin={isSuperAdmin}
      />

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
  );
}
