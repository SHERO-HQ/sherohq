"use client";

import React, { useState } from "react";
import { useAdminUser } from "@/hooks/queries/useAdminQuery";
import {
  useAdminUsers,
  useRegisterAdminUser,
  useUpdateAdminUserRole,
  useDeleteAdminUser,
  useResetStaffPassword,
  useToggleStaffActive,
} from "@/hooks/queries/useAdminUsers";
import { useNotifications } from "@/hooks/useNotifications";

export function useAdminUserManagement() {
  const { data: adminData } = useAdminUser();
  const currentAdmin = adminData?.admin;
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

  return {
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
  };
}
