"use client";
import React, { useState, useMemo } from "react";
import { Loader2, ShoppingBag, CreditCard, ArrowRight, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import OrderItem from "./OrderItem";
import type { Order, User } from "@/services/api";

interface OrderHistoryProps {
  orders: Order[];
  loading: boolean;
  user: User | null;
  expandedOrder: string | null;
  onToggleExpand: (id: string) => void;
}

type OrderFilter = "all" | "pending" | "delivered" | "processing";

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  loading,
  user,
  expandedOrder,
  onToggleExpand,
}) => {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderFilter>("all");

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status.toLowerCase() === "pending"),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "pending") return pendingOrders;
    return orders.filter((o) => o.status.toLowerCase() === filter);
  }, [orders, filter, pendingOrders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No orders yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Looks like you haven't made any purchases yet.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="cursor-pointer px-6 py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white font-medium rounded transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Orders Attention Banner */}
      {pendingOrders.length > 0 && (
        <div className="p-4 sm:p-5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                You have {pendingOrders.length} {pendingOrders.length === 1 ? "order" : "orders"} awaiting payment
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Complete payment now to confirm your order and keep your reserved items.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFilter("pending");
              if (pendingOrders.length > 0) {
                onToggleExpand(pendingOrders[0].id);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded shadow-sm transition-colors shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Review & Pay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            filter === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          All ({orders.length})
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            filter === "pending"
              ? "bg-amber-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Pending Payment
          {pendingOrders.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filter === "pending"
                  ? "bg-white text-yellow-500"
                  : "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/40 dark:text-yellow-300"
              }`}
            >
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter("delivered")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            filter === "delivered"
              ? "bg-brand-secondary-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Delivered
        </button>

        <button
          onClick={() => setFilter("processing")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            filter === "processing"
              ? "bg-blue-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Processing / In Transit
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No orders found under &quot;{filter}&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              user={user}
              isExpanded={expandedOrder === order.id}
              onToggle={() => onToggleExpand(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
