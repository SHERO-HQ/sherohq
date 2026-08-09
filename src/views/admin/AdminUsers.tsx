"use client";
import { toReadableOrderId } from "@/utils/orderId";
import { useState, useEffect } from "react";
import { } from "@/context/AdminContext";
import { getErrorMessage } from "@/utils/error";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Package,
  RefreshCw,
  Printer,
  BadgeCheck,
  BadgeX,
  KeyRound,
  Ban,
  CircleCheck
} from "lucide-react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  useCustomers,
  useCustomerDetails,
  useDeleteCustomer,
  useResetUserPassword,
  useToggleUserActive
} from "@/hooks/queries/useUsers";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import AppImage from "@/components/common/AppImage";
import type {
  AdminUserListItem,
  AdminUserDetails,
  AdminUserStats,
  AdminUsersPagination,
  Order
} from "@/services/api";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const formatCurrency = (amount: number) => {
  return `GHS${amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    processing: "bg-blue-500/20 text-blue-400",
    intransit: "bg-purple-500/20 text-purple-400",
    delivered: "bg-brand-secondary-500/20 text-brand-secondary-400",
    cancelled: "bg-red-500/20 text-red-400"
  };
  return colors[status.toLowerCase()] || "bg-slate-500/20 text-muted-foreground";
};

// --- Sub-components ---

interface HeaderProps {
  isFetching: boolean;
  refetchUsers: () => void;
  handleExport: (format: "csv" | "excel" | "pdf") => void;
  search: string;
  setSearch: (v: string) => void;
}

const AdminUsersHeader = ({
  isFetching,
  refetchUsers,
  handleExport,
  search,
  setSearch }: HeaderProps) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Users className="w-7 h-7 text-brand-secondary-400" />
          Customers
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your customer database and view their activity
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetchUsers()}
          disabled={isFetching}
          className="bg-muted/50 border-border"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-medium px-6">
              <Printer className="mr-2 h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-foreground"
          >
            <DropdownMenuItem
              onClick={() => handleExport("csv")}
              className="cursor-pointer hover:bg-accent"
            >
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport("excel")}
              className="cursor-pointer hover:bg-accent"
            >
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport("pdf")}
              className="cursor-pointer hover:bg-accent"
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    {/* Search Input */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500/50"
        />
      </div>
    </div>
  </div>
);

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
  isTogglingActive }: UserTableRowProps) => (
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
          className={`p-2 rounded transition-colors disabled:opacity-50 ${user.isActive
              ? "text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10"
              : "text-muted-foreground hover:text-brand-secondary-400 hover:bg-brand-secondary-500/10"
            }`}
          title={user.isActive ? "Deactivate Account" : "Reactivate Account"}
        >
          {user.isActive ? (
            <Ban className="w-4 h-4" />
          ) : (
            <CircleCheck className="w-4 h-4" />
          )}
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

interface UserTableProps {
  loading: boolean;
  users: AdminUserListItem[];
  openDetails: (id: string) => void;
  setDeleteConfirmId: (id: string) => void;
  onResetPassword: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isTogglingActive: boolean;
}

interface StatsCardsProps {
  total: number;
  users: AdminUserListItem[];
}

const StatsCards = ({ total, users }: StatsCardsProps) => {
  const verifiedCount = users.filter(
    (u: AdminUserListItem) => u.emailVerified,
  ).length;
  const newThisMonthCount = users.filter((u: AdminUserListItem) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-muted/30  border border-border rounded p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-secondary-500/20 rounded">
            <Users className="w-5 h-5 text-brand-secondary-400" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Customers</p>
            <p className="text-xl font-bold text-foreground">{total}</p>
          </div>
        </div>
      </div>
      <div className="bg-muted/30  border border-border rounded p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded">
            <BadgeCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Verified Users</p>
            <p className="text-xl font-bold text-foreground">{verifiedCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-muted/30  border border-border rounded p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">This Month</p>
            <p className="text-xl font-bold text-foreground">{newThisMonthCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersListSkeleton = () => (
  <div className="overflow-x-auto select-none animate-pulse">
    <table className="w-full">
      <thead className="bg-card/50">
        <tr>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Customer</th>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Contact</th>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Joined</th>
          <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
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

const UserDetailsSkeleton = () => (
  <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)] animate-pulse select-none">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded bg-accent shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-40 bg-accent rounded" />
        <div className="h-4 w-52 bg-accent/50 rounded" />
        <div className="h-3.5 w-32 bg-accent/50 rounded" />
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="h-6 w-20 bg-accent rounded" />
        <div className="h-6 w-24 bg-accent rounded" />
      </div>
    </div>

    <hr className="border-border" />

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/20 border border-border rounded p-4 space-y-2">
        <div className="h-4 w-24 bg-accent/50 rounded" />
        <div className="h-6 w-16 bg-accent rounded" />
      </div>
      <div className="bg-muted/20 border border-border rounded p-4 space-y-2">
        <div className="h-4 w-24 bg-accent/50 rounded" />
        <div className="h-6 w-16 bg-accent rounded" />
      </div>
    </div>

    <hr className="border-border" />

    <div className="space-y-3">
      <div className="h-5 w-32 bg-accent rounded" />
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="bg-muted/20 border border-border rounded p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-accent rounded" />
              <div className="h-3 w-32 bg-accent/50 rounded" />
            </div>
            <div className="h-5 w-16 bg-accent/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UserTable = ({
  loading,
  users,
  openDetails,
  setDeleteConfirmId,
  onResetPassword,
  onToggleActive,
  isTogglingActive }: UserTableProps) => {
  if (loading && !users.length) {
    return <UsersListSkeleton />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-card/50">
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
    </div>
  );
};

interface PaginationProps {
  pagination: AdminUsersPagination;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination = ({ pagination, setPage }: PaginationProps) => {
  if (pagination.totalPages <= 1) return null;

  return (
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
  );
};

interface UserStatsGridProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string | null;
  };
}

const UserStatsGrid = ({ stats }: UserStatsGridProps) => (
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-muted/50 rounded p-4 text-center">
      <ShoppingBag className="w-6 h-6 text-brand-secondary-400 mx-auto mb-2" />
      <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
      <p className="text-xs text-muted-foreground">Total Orders</p>
    </div>
    <div className="bg-muted/50 rounded p-4 text-center">
      <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
      <p className="text-2xl font-bold text-foreground">
        {formatCurrency(stats.totalSpent)}
      </p>
      <p className="text-xs text-muted-foreground">Total Spent</p>
    </div>
    <div className="bg-muted/50 rounded p-4 text-center">
      <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
      <p className="text-sm font-bold text-foreground">
        {stats.lastOrderDate ? formatDate(stats.lastOrderDate) : "N/A"}
      </p>
      <p className="text-xs text-muted-foreground">Last Order</p>
    </div>
  </div>
);

interface OrderHistoryListProps {
  orders: Order[];
}

const OrderHistoryList = ({ orders }: OrderHistoryListProps) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded">
        <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-87.5 overflow-y-auto custom-scrollbar pr-2">
      {orders.slice(0, 5).map((order) => (
        <div
          key={order.id}
          className="bg-muted/30 rounded p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-foreground font-medium">
              Order {toReadableOrderId(order.id)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.items?.length || 0} item(s) • {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-foreground font-medium">
              {formatCurrency(Number(order.total))}
            </p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface UserDetailsModalProps {
  show: boolean;
  onClose: () => void;
  loading: boolean;
  user: AdminUserDetails | null | undefined;
  orders: Order[];
  stats: AdminUserStats | null | undefined;
  onResetPassword: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  isTogglingActive: boolean;
}

const UserDetailsModal = ({
  show,
  onClose,
  loading,
  user,
  orders,
  stats,
  onResetPassword,
  onToggleActive,
  onDelete,
  isTogglingActive }: UserDetailsModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
    {show && (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70  z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <m.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Customer Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          {(() => {
            if (loading) {
              return <UserDetailsSkeleton />;
            }

            if (!user) {
              return (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">User not found</p>
                </div>
              );
            }

            return (
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded bg-linear-to-br from-brand-secondary-500 to-blue-500 flex items-center justify-center text-foreground text-2xl font-bold overflow-hidden">
                    {user.avatar ? (
                      <AppImage
                        src={user.avatar}
                        alt={user.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {user.name}
                    </h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.phone && (
                      <p className="text-muted-foreground text-sm">{user.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${user.emailVerified
                          ? "bg-brand-secondary-500/20 text-brand-secondary-400"
                          : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${user.isActive !== false
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {user.isActive !== false ? "Active" : "Deactivated"}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                {stats && <UserStatsGrid stats={stats} />}

                {/* Order History */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Recent Orders
                  </h4>
                  <OrderHistoryList orders={orders} />
                </div>

                {/* Admin Actions */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Account Actions
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        onResetPassword(user.id);
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors text-sm"
                    >
                      <KeyRound className="w-4 h-4" />
                      Force Password Reset
                    </button>
                    <button
                      onClick={() => onToggleActive(user.id, !user.isActive)}
                      disabled={isTogglingActive}
                      className={`flex items-center gap-2 px-4 py-2 border rounded transition-colors text-sm disabled:opacity-50 ${user.isActive !== false
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                          : "bg-brand-secondary-500/10 text-brand-secondary-400 border-brand-secondary-500/20 hover:bg-brand-secondary-500/20"
                        }`}
                    >
                      {user.isActive !== false ? (
                        <>
                          <Ban className="w-4 h-4" /> Deactivate Account
                        </>
                      ) : (
                        <>
                          <CircleCheck className="w-4 h-4" /> Reactivate Account
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onDelete(user.id);
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </m.div>
      </m.div>
    )}
  </AnimatePresence>,
  document.body
);
};

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
  isPending }: ResetPasswordModalProps) => {
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
        className="fixed inset-0 bg-black/70  z-50 flex items-center justify-center p-4"
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
            <h3 className="text-xl font-bold text-foreground mb-2">
              Reset Password?
            </h3>
            <p className="text-muted-foreground mb-6">
              <span className="text-foreground font-medium">{userName}</span> will be
              logged out and required to set a new password on their next login.
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
  document.body
);
};

const DeleteConfirmationModal = ({
  userId,
  onClose,
  onConfirm,
  isPending }: DeleteModalProps) => {
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
        className="fixed inset-0 bg-black/70  z-50 flex items-center justify-center p-4"
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
            <h3 className="text-xl font-bold text-foreground mb-2">
              Delete Customer?
            </h3>
            <p className="text-muted-foreground mb-6">
              This action cannot be undone. The customer's account and all
              associated data will be permanently removed.
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
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </m.div>
      </m.div>
    )}
  </AnimatePresence>,
  document.body
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
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Main users query
  const {
    data: usersData,
    isLoading: loading,
    isPlaceholderData,
    refetch: refetchUsers,
    isFetching } = useCustomers(
      {
        page,
        limit: 20,
        search: debouncedSearch
      },
      ADMIN_POLLING_INTERVAL,
    );

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
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
        isActive
          ? "Account has been reactivated."
          : "Account has been deactivated.",
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
      JoinedDate: new Date(user.createdAt).toLocaleDateString()
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
    addNotification(
      "Success",
      `Exported as ${format.toUpperCase()}`,
      "success",
    );
  };

  return (
    <div className="space-y-6 relative">
      {isPlaceholderData && (
        <div className="absolute inset-0 bg-card/10 -[1px] z-10 pointer-events-none transition-opacity" />
      )}

      <AdminUsersHeader
        isFetching={isFetching}
        refetchUsers={refetchUsers}
        handleExport={handleExport}
        search={search}
        setSearch={setSearch}
      />

      <StatsCards total={pagination.total} users={users} />

      {/* Users Table */}
      <div className="bg-muted/30  border border-border rounded overflow-hidden relative">
        <UserTable
          loading={loading}
          users={users}
          openDetails={openDetails}
          setDeleteConfirmId={setDeleteConfirmId}
          onResetPassword={setResetPasswordId}
          onToggleActive={handleToggleActive}
          isTogglingActive={toggleActiveMutation.isPending}
        />
        <Pagination pagination={pagination} setPage={setPage} />
      </div>

      <UserDetailsModal
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
          users.find((u) => u.id === resetPasswordId)?.name ||
          selectedUser?.name ||
          ""
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
