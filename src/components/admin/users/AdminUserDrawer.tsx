"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  ShoppingBag,
  Package,
  KeyRound,
  Ban,
  CircleCheck,
  Trash2,
} from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { toReadableOrderId } from "@/utils/orderId";
import type { AdminUserDetails, AdminUserStats, Order } from "@/services/api";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
    cancelled: "bg-red-500/20 text-red-400",
  };
  return colors[status.toLowerCase()] || "bg-muted text-muted-foreground";
};

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
        <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
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
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export interface AdminUserDrawerProps {
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

export function AdminUserDrawer({
  show,
  onClose,
  loading,
  user,
  orders,
  stats,
  onResetPassword,
  onToggleActive,
  onDelete,
  isTogglingActive,
}: AdminUserDrawerProps) {
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
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
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
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          user.emailVerified
                            ? "bg-brand-secondary-500/20 text-brand-secondary-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          user.isActive !== false
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
                        className={`flex items-center gap-2 px-4 py-2 border rounded transition-colors text-sm disabled:opacity-50 ${
                          user.isActive !== false
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
    document.body,
  );
}
