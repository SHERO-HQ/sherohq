"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { m } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Truck,
  CreditCard,
  ArrowRight,
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

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "delivered")
    return "bg-brand-secondary-500/20 text-brand-secondary-400 border border-brand-secondary-500/30";
  if (s === "pending")
    return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  if (s === "cancelled")
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
  return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
};

export default function TrackOrder({
  orderId,
  orderAccessToken,
}: TrackOrderProps) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderAccessToken) {
      saveOrderAccessToken(orderId, orderAccessToken);
    }
  }, [orderAccessToken, orderId]);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        orderAccessToken || getOrderAccessToken(orderId) || undefined;
      const data = await trackOrder(orderId, token);
      setOrder(data as TrackedOrder);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order. Please verify your order number and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderAccessToken, orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const isStorePickupOrder = useMemo(() => {
    return (order?.paymentMethod || "").toLowerCase() === "store_pickup";
  }, [order?.paymentMethod]);

  const readableId = displayOrderId(orderId);
  const hasFullDetails = (orderData: TrackedOrder): orderData is Order => {
    return Array.isArray(orderData.items) && typeof orderData.total === "number";
  };

  const isPending = order?.status?.toLowerCase() === "pending";
  const resolvedToken = orderAccessToken || getOrderAccessToken(orderId);
  const payUrl = `/checkout/pay?id=${order?.id || orderId}${resolvedToken ? `&token=${encodeURIComponent(resolvedToken)}` : ""}`;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-2xl mx-auto px-4 space-y-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Order Tracking
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Order {readableId}
            </h1>
          </div>

          {isLoading && (
            <div className="text-center py-10">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-secondary-500" />
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
              {/* Pending Order Notice */}
              {isPending && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        Payment Pending Confirmation
                      </h3>
                      <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                        Your order is reserved. Complete payment to begin dispatch.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={payUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded shadow-sm transition-colors shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Complete Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

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
                  <div className="flex items-center gap-3">
                    {isPending && (
                      <Link
                        href={payUrl}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Now</span>
                      </Link>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {isStorePickupOrder ? (
                <div className="rounded border border-brand-secondary-200/70 dark:border-brand-secondary-800/60 bg-brand-secondary-500/5 p-4 text-sm text-brand-secondary-700 dark:text-brand-secondary-300">
                  This order is marked for store pickup. Delivery tracking is
                  not available.
                </div>
              ) : (
                <div className="rounded border border-slate-200 dark:border-slate-700 p-6">
                  {order.status.toLowerCase() === "cancelled" ? (
                    <div className="text-center text-rose-500 font-medium">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      Order Cancelled
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-between w-full">
                      {/* Connecting line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full -z-10"></div>

                      {/* Progress line */}
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-secondary-500 rounded-full -z-10 transition-all duration-500"
                        style={{
                          width: order.status.toLowerCase() === 'pending' ? '0%' :
                            order.status.toLowerCase() === 'processing' ? '33%' :
                              order.status.toLowerCase() === 'intransit' ? '66%' :
                                order.status.toLowerCase() === 'delivered' ? '100%' : '0%'
                        }}
                      ></div>

                      {[
                        { id: 'pending', label: 'Pending', icon: Clock },
                        { id: 'processing', label: 'Processing', icon: RefreshCw },
                        { id: 'intransit', label: 'In Transit', icon: Truck },
                        { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
                      ].map((step, index) => {
                        const statuses = ['pending', 'processing', 'intransit', 'delivered'];
                        const currentIdx = statuses.indexOf(order.status.toLowerCase() || 'pending');
                        const isCompleted = index <= currentIdx;
                        const isCurrent = index === currentIdx;

                        return (
                          <div key={step.id} className="flex flex-col items-center bg-white dark:bg-slate-900 px-2 sm:px-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                ? 'bg-brand-secondary-500 border-brand-secondary-500 text-white shadow-sm shadow-brand-secondary-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                              }`}>
                              <step.icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                            </div>
                            <span className={`text-[11px] sm:text-xs font-medium mt-2 ${isCompleted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                      {order.items.length === 1 ? "" : "s"} • Total GHS
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
                          GHS{(item.price * item.quantity).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        </m.div>

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
