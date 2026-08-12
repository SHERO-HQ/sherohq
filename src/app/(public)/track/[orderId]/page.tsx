"use client";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Copy, Check, AlertCircle } from "lucide-react";
import { trackOrder, type Order } from "@/services/orders";
import { useUser } from "@/hooks/queries/useAuthQuery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toReadableOrderId } from "@/utils/orderId";
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

  const readableId = useMemo(() => toReadableOrderId(orderId), [orderId]);
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
      await navigator.clipboard.writeText(readableId);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-26 space-y-8">
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
          <Badge
            className={cn(
              "text-xs px-4 py-1 w-fit capitalize font-medium tracking-wider",
              order.status === "cancelled"
                ? "bg-rose-500 text-white"
                : "bg-brand-secondary-500 text-white",
            )}
          >
            {order.status}
          </Badge>
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
