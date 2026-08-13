"use client";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Copy, Check, AlertCircle, CreditCard, ArrowRight, Clock } from "lucide-react";
import { trackOrder, type Order } from "@/services/orders";
import { useUser } from "@/hooks/queries/useAuthQuery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toReadableOrderId, displayOrderId } from "@/utils/orderId";
import { TrackTimeline } from "@/components/track/TrackTimeline";
import { TrackOrderItems } from "@/components/track/TrackOrderItems";
import { TrackShippingInfo } from "@/components/track/TrackShippingInfo";
import { TrackActivityLogs } from "@/components/track/TrackActivityLogs";
import { TrackSecurityRecommendation } from "@/components/track/TrackSecurityRecommendation";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default function TrackOrderPage({ params, searchParams }: Props) {
  const { orderId } = use(params);
  const { token } = use(searchParams);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { data: userData } = useUser();
  const isAuthenticated = !!userData?.user;

  useEffect(() => {
    if (!orderId) return;

    // Backwards compatibility for ticket tracking links that were sent out before the route split
    if (/^\d+$/.test(orderId)) {
      router.replace(`/support/track/${orderId}`);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await trackOrder(orderId, token);
        setOrder(data);
        setError(null);
      } catch (err: unknown) {
        console.error("Tracking Error:", err);
        setError(
          "We couldn't find an order with that ID. Please check the link and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token, router]);

  const readableId = useMemo(() => displayOrderId(orderId), [orderId]);
  const isStorePickupOrder =
    (order?.paymentMethod || "").toLowerCase() === "store_pickup";
  const hasOrderItems = Array.isArray((order as Partial<Order>)?.items);
  const hasOrderTotal = typeof (order as Partial<Order>)?.total === "number";
  const hasShippingInfo = Boolean((order as Partial<Order>)?.shippingInfo);
  const orderItems = hasOrderItems
    ? (((order as Partial<Order>).items ?? []) as Order["items"])
    : [];
  const shippingInfo = order && hasShippingInfo ? order.shippingInfo : null;

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(toReadableOrderId(orderId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy order ID:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-secondary-500/20 border-t-brand-secondary-500 rounded-full animate-spin" />
            <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-secondary-500" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">
            Locating your order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Order Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {error || "The link might be broken or the order doesn't exist."}
          </p>
          <div className="pt-4">
            <Button asChild className="bg-brand-secondary-600 hover:bg-brand-secondary-700">
              <Link href="/support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPending = order.status.toLowerCase() === "pending";
  const payUrl = `/checkout/pay?id=${order.id}${token ? `&token=${encodeURIComponent(token)}` : ""}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-26 space-y-8">
        {/* Pending Order Recovery Callout */}
        {isPending && (
          <div className="p-4 sm:p-5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Payment Awaiting Confirmation
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Your order has been created. Complete payment to secure your stock and begin processing.
                </p>
              </div>
            </div>
            <Link
              href={payUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded shadow-sm transition-colors shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Complete Payment Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-sm font-medium dark:text-slate-500 text-slate-600 tracking-tight">
              Order ID:{" "}
              <span className="text-brand-secondary-500 text-lg">{readableId}</span>
            </h1>
            <button
              type="button"
              onClick={() => void handleCopyOrderId()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
              aria-label="Copy order ID"
              title="Copy order ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy ID
                </>
              )}
            </button>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPending && (
              <Link
                href={payUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Now</span>
              </Link>
            )}
            <Badge
              className={cn(
                "text-xs px-4 py-1 w-fit capitalize font-medium tracking-wider",
                order.status === "cancelled"
                  ? "bg-rose-500 text-white"
                  : isPending
                    ? "bg-amber-500 text-white"
                    : "bg-brand-secondary-500 text-white",
              )}
            >
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Tracking Timeline */}
        <TrackTimeline
          order={order}
          isStorePickupOrder={isStorePickupOrder}
        />

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <TrackOrderItems
              order={order}
              hasOrderItems={hasOrderItems}
              hasOrderTotal={hasOrderTotal}
              orderItems={orderItems}
            />
            <TrackSecurityRecommendation isAuthenticated={isAuthenticated} />
          </div>

          <TrackShippingInfo
            shippingInfo={shippingInfo}
            isStorePickupOrder={isStorePickupOrder}
          />
        </div>

        {/* Detailed Timeline */}
        <TrackActivityLogs activityLogs={(order as any).activityLogs} />
      </div>
    </div>
  );
}
