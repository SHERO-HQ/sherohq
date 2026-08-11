"use client";

import React from "react";
import {
  Mail,
  Phone,
  Eye,
  Trash2,
  BadgeCheck,
  BadgeX,
  KeyRound,
  Ban,
  CircleCheck,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { m } from "motion/react";
import AppImage from "@/components/common/AppImage";
import type { AdminUserListItem, AdminUsersPagination } from "@/services/api";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

interface UserTableRowProps {
  user: AdminUserListItem;
  onOpenDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onResetPassword: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isTogglingActive: boolean;
}

const UserTableRow = ({
  user,
  onOpenDetails,
  onDelete,
  onResetPassword,
  onToggleActive,
  isTogglingActive,
}: UserTableRowProps) => (
  <m.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="hover:bg-accent transition-colors"
  >
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded bg-linear-to-br from-brand-secondary-500 to-brand-secondary-500/60 font-bold text-lg flex items-center justify-center text-foreground overflow-hidden">
          {user.avatar ? (
            <AppImage
              src={user.avatar}
              alt={user.name}
              fill
              sizes="40px"
              className="object-cover rounded"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4 text-muted-foreground" />
          {user.email}
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 text-muted-foreground" />
            {user.phone}
          </div>
        )}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-1">
        {user.emailVerified ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-brand-secondary-500/20 text-brand-secondary-400">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <BadgeX className="w-3 h-3" />
            Unverified
          </span>
        )}
        {!user.isActive && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
            <Ban className="w-3 h-3" />
            Deactivated
          </span>
        )}
      </div>
    </td>
    <td className="px-6 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onOpenDetails(user.id)}
          className="p-2 text-muted-foreground hover:text-brand-secondary-400 hover:bg-brand-secondary-500/10 rounded transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onResetPassword(user.id)}
          className="p-2 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
          title="Reset Password"
        >
          <KeyRound className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleActive(user.id, !user.isActive)}
          disabled={isTogglingActive}
          className={`p-2 rounded transition-colors disabled:opacity-50 ${
            user.isActive
              ? "text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10"
              : "text-muted-foreground hover:text-brand-secondary-400 hover:bg-brand-secondary-500/10"
          }`}
          title={user.isActive ? "Deactivate Account" : "Reactivate Account"}
        >
          {user.isActive ? <Ban className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Delete User"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </m.tr>
);

const UsersListSkeleton = () => (
  <div className="overflow-auto max-h-[calc(100vh-18rem)] select-none animate-pulse">
    <table className="w-full">
      <thead className="bg-card/95 backdrop-blur-xs sticky top-0 z-10 border-b border-border shadow-xs">
        <tr>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
            Customer
          </th>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
            Contact
          </th>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
            Status
          </th>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
            Joined
          </th>
          <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="bg-muted/10">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-accent/50 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-accent rounded" />
                  <div className="h-3 w-36 bg-accent/50 rounded" />
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="space-y-2">
                <div className="h-3 w-32 bg-accent/50 rounded" />
                <div className="h-3.5 w-24 bg-accent/50 rounded" />
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-accent/50 rounded-full" />
                <div className="h-5 w-16 bg-accent/50 rounded-full" />
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="h-3.5 w-20 bg-accent/50 rounded" />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="inline-block h-8 w-8 bg-accent/50 rounded" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface AdminUsersTableProps {
  loading: boolean;
  users: AdminUserListItem[];
  openDetails: (id: string) => void;
  setDeleteConfirmId: (id: string) => void;
  onResetPassword: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isTogglingActive: boolean;
  pagination?: AdminUsersPagination;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

export function AdminUsersTable({
  loading,
  users,
  openDetails,
  setDeleteConfirmId,
  onResetPassword,
  onToggleActive,
  isTogglingActive,
  pagination,
  setPage,
}: AdminUsersTableProps) {
  if (loading && !users.length) {
    return <UsersListSkeleton />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[calc(100vh-18rem)]">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky top-0 z-10 bg-card border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
              Customer
            </th>
            <th className="sticky top-0 z-10 bg-card border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
              Contact
            </th>
            <th className="sticky top-0 z-10 bg-card border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
              Status
            </th>
            <th className="sticky top-0 z-10 bg-card border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
              Joined
            </th>
            <th className="sticky top-0 z-10 bg-card border-b border-border text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              onOpenDetails={openDetails}
              onDelete={setDeleteConfirmId}
              onResetPassword={onResetPassword}
              onToggleActive={onToggleActive}
              isTogglingActive={isTogglingActive}
            />
          ))}
        </tbody>
      </table>

      {pagination && setPage && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} customers
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
