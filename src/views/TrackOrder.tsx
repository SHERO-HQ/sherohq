"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Truck,
} from "lucide-react";
import { trackOrder, type Order, type OrderItem } from "@/services/api";
import { getOrderAccessToken, saveOrderAccessToken } from "@/utils/orderAccess";
import { displayOrderId } from "@/utils/orderId";

type TrackOrderProps = {
  orderId: string;
  orderAccessToken?: string;
};

type TrackedOrder = Partial<Order> & {
  id: string;
  status: string;
  createdAt: Date | string;
  items?: OrderItem[];
};

const hasFullDetails = (order: TrackedOrder | null): order is Order => {
  return Boolean(
    order &&
    Array.isArray(order.items) &&
    order.shippingInfo &&
    typeof order.total === "number",
  );
};

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "pending")
    return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  if (s === "processing")
    return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
  if (s === "intransit")
    return "bg-purple-500/15 text-purple-600 dark:text-purple-400";
  if (s === "delivered")
    return "bg-brand-secondary-500/15 text-brand-secondary-600 dark:text-brand-secondary-400";
  if (s === "cancelled")
    return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
  return "bg-slate-500/15 text-slate-600 dark:text-slate-400";
};

export default function TrackOrder({
  orderId,
  orderAccessToken,
}: TrackOrderProps) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const shortId = useMemo(() => displayOrderId(orderId), [orderId]);
  const isStorePickupOrder =
    (order?.paymentMethod || "").toLowerCase() === "store_pickup";

  useEffect(() => {
    if (orderAccessToken) {
      saveOrderAccessToken(orderId, orderAccessToken);
    }
  }, [orderAccessToken, orderId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const token =
        orderAccessToken || getOrderAccessToken(orderId) || undefined;
      const data = await trackOrder(orderId, token);
      setOrder(data as TrackedOrder);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to track order right now.",
      );
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderAccessToken, orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Track Your Order
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Reference: {shortId}
              </p>
            </div>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {isLoading && (
            <div className="py-14 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-brand-secondary-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Checking latest order status...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded border border-rose-300/40 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && order && (
            <div className="space-y-6">
              <div className="rounded border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Current Status
                    </p>
                    <span
                      className={`inline-flex mt-2 px-2.5 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {isStorePickupOrder ? (
                <div className="rounded border border-brand-secondary-200/70 dark:border-brand-secondary-800/60 bg-brand-secondary-500/5 p-4 text-sm text-brand-secondary-700 dark:text-brand-secondary-300">
                  This order is marked for store pickup. Delivery tracking is
                  not available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded border border-slate-200 dark:border-slate-700 p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pending
                    </p>
                  </div>
                  <div className="rounded border border-slate-200 dark:border-slate-700 p-3 text-center">
                    <Truck className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Shipping
                    </p>
                  </div>
                  <div className="rounded border border-slate-200 dark:border-slate-700 p-3 text-center">
                    <CheckCircle2 className="w-4 h-4 mx-auto text-brand-secondary-500 mb-1" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Delivered
                    </p>
                  </div>
                </div>
              )}

              {hasFullDetails(order) ? (
                <>
                  <div className="rounded border border-slate-200 dark:border-slate-700 p-4">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Order Summary
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {order.items.length} item
                      {order.items.length === 1 ? "" : "s"} • Total GH₵
                      {order.total.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {order.items.map((item) => (
                      <div
                        key={item.id || item.name}
                        className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          GH₵{(item.price * item.quantity).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300">
                  Detailed information is hidden for security. Sign in with the
                  purchasing account or use this link from the original checkout
                  to view full details.
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="text-center">
          <Link
            href="/support"
            className="text-sm text-brand-secondary-600 dark:text-brand-secondary-400 hover:underline"
          >
            Need help with this order?
          </Link>
        </div>
      </div>
    </div>
  );
}
