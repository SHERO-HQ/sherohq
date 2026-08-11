"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/utils/error";
import { Loader2, KeyRound, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  useCustomers,
  useCustomerDetails,
  useDeleteCustomer,
  useResetUserPassword,
  useToggleUserActive,
} from "@/hooks/queries/useUsers";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { AdminUsersHeader } from "@/components/admin/users/AdminUsersHeader";
import { AdminUsersStats } from "@/components/admin/users/AdminUsersStats";
import { AdminUsersTable } from "@/components/admin/users/AdminUsersTable";
import { AdminUserDrawer } from "@/components/admin/users/AdminUserDrawer";

interface DeleteModalProps {
  userId: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
}

interface ResetPasswordModalProps {
  userId: string | null;
  userName: string;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
}

const ResetPasswordModal = ({
  userId,
  userName,
  onClose,
  onConfirm,
  isPending,
}: ResetPasswordModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {userId && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Reset Password?</h3>
              <p className="text-muted-foreground mb-6">
                <span className="text-foreground font-medium">{userName}</span> will be logged out and required to set a new password on their next login.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(userId)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-foreground rounded hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Reset Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

const DeleteConfirmationModal = ({
  userId,
  onClose,
  onConfirm,
  isPending,
}: DeleteModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {userId && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Delete Customer?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The customer's account and all associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(userId)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-foreground rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const { addNotification } = useNotifications();

  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Main users query
  const {
    data: usersData,
    isLoading: loading,
    isPlaceholderData,
    refetch: refetchUsers,
    isFetching,
  } = useCustomers(
    {
      page,
      limit: 20,
      search: debouncedSearch,
    },
    ADMIN_POLLING_INTERVAL,
  );

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  // User details query
  const { data: detailsData, isLoading: detailsLoading } = useCustomerDetails(
    selectedUserId || "",
  );

  const selectedUser = detailsData?.user;
  const userOrders = detailsData?.orders || [];
  const userStats = detailsData?.stats;

  // Delete mutation
  const deleteMutation = useDeleteCustomer();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reset password mutation
  const resetPasswordMutation = useResetUserPassword();
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);

  // Toggle active mutation
  const toggleActiveMutation = useToggleUserActive();

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteMutation.mutateAsync(userId);
      addNotification("Success", "User deleted successfully", "success");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      addNotification("Error", getErrorMessage(error, "Failed to delete user"), "error");
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await resetPasswordMutation.mutateAsync(userId);
      addNotification(
        "Password Reset",
        "User will be prompted to change their password on next login.",
        "success",
      );
      setResetPasswordId(null);
    } catch (error) {
      console.error("Error resetting password:", error);
      addNotification("Error", getErrorMessage(error, "Failed to reset password"), "error");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({ userId, isActive });
      addNotification(
        "Account Updated",
        isActive ? "Account has been reactivated." : "Account has been deactivated.",
        "success",
      );
    } catch (error) {
      console.error("Error toggling account status:", error);
      addNotification("Error", getErrorMessage(error, "Failed to update account status"), "error");
    }
  };

  const openDetails = (userId: string) => {
    setSelectedUserId(userId);
    setShowDetailsModal(true);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (!users || users.length === 0) {
      addNotification("Warning", "No customer data to export", "warning");
      return;
    }

    const exportData = users.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone || "N/A",
      Status: user.emailVerified ? "Verified" : "Unverified",
      JoinedDate: new Date(user.createdAt).toLocaleDateString(),
    }));

    const fileName = `customers_export_${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      exportToCSV(exportData, fileName);
    } else if (format === "excel") {
      exportToExcel(exportData, fileName);
    } else if (format === "pdf") {
      exportToPDF(
        exportData,
        ["ID", "Name", "Email", "Phone", "Status", "JoinedDate"],
        fileName,
        "Customer Directory",
      );
    }
    addNotification("Success", `Exported as ${format.toUpperCase()}`, "success");
  };

  return (
    <div className="space-y-6 relative">
      {isPlaceholderData && (
        <div className="absolute inset-0 bg-card/10 z-10 pointer-events-none transition-opacity" />
      )}

      <div className="sticky top-20 z-20 bg-background/95 backdrop-blur-md py-3 pb-4 -mx-3 px-3 md:-mx-6 md:px-6 border-b border-border/50 shadow-xs rounded-b">
        <AdminUsersHeader
          isFetching={isFetching}
          refetchUsers={refetchUsers}
          handleExport={handleExport}
          search={search}
          setSearch={setSearch}
        />
      </div>

      <AdminUsersStats total={pagination.total} users={users} />

      {/* Users Table */}
      <div className="bg-muted/30 border border-border rounded overflow-hidden relative">
        <AdminUsersTable
          loading={loading}
          users={users}
          openDetails={openDetails}
          setDeleteConfirmId={setDeleteConfirmId}
          onResetPassword={setResetPasswordId}
          onToggleActive={handleToggleActive}
          isTogglingActive={toggleActiveMutation.isPending}
          pagination={pagination}
          setPage={setPage}
        />
      </div>

      <AdminUserDrawer
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        loading={detailsLoading}
        user={selectedUser}
        orders={userOrders}
        stats={userStats}
        onResetPassword={setResetPasswordId}
        onToggleActive={handleToggleActive}
        onDelete={setDeleteConfirmId}
        isTogglingActive={toggleActiveMutation.isPending}
      />

      <ResetPasswordModal
        userId={resetPasswordId}
        userName={
          users.find((u) => u.id === resetPasswordId)?.name || selectedUser?.name || ""
        }
        onClose={() => setResetPasswordId(null)}
        onConfirm={handleResetPassword}
        isPending={resetPasswordMutation.isPending}
      />

      <DeleteConfirmationModal
        userId={deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteUser}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
