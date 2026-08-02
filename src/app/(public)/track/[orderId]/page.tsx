"use client";
import { toReadableOrderId } from "@/utils/orderId";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Copy,
  Check,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  Mail,
  Phone,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import { trackOrder, type Order } from "@/services/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { displayOrderId } from "@/utils/orderId";

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

  useEffect(() => {
    if (!orderId) return;

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
  }, [orderId, token]);

  const getStatusStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending" || s === "quote") return 1;
    if (s === "processing") return 2;
    if (s === "intransit") return 3;
    if (s === "delivered") return 4;
    if (s === "cancelled") return -1;
    return 1;
  };

  const steps = [
    { label: "Ordered", icon: ShoppingBag },
    { label: "Processing", icon: Clock },
    { label: "In Transit", icon: Truck },
    { label: "Delivered", icon: PackageCheck },
  ];

  const currentStep = order ? getStatusStep(order.status) : 0;
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
            <div className="w-16 h-16 border-4 border-brand-secondary-500/20 border-t-brand-secondary-500 rounded-full animate-spin"></div>
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
          <h1 className="text-2xl font-bold dark:text-white">
            Order Not Found
          </h1>
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
        {order.status !== "cancelled" && !isStorePickupOrder ? (
          <Card className="py-6 dark:bg-slate-900 border-none shadow-sm overflow-hidden border">
            <div className="relative">
              {/* Progress Line Background */}
              <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
              {/* Active Progress Line */}
              <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 z-0">
                <div
                  className="absolute top-0 left-0 h-1 bg-brand-secondary-500 transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="relative z-10 grid grid-cols-4 gap-2">
                {steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = currentStep > stepNum;
                  const isActive = currentStep === stepNum;

                  return (
                    <div
                      key={step.label}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 mx-auto",
                          isCompleted
                            ? "bg-brand-secondary-500 text-white"
                            : isActive
                              ? "bg-brand-secondary-500 text-white scale-110 shadow shadow-brand-secondary-500/20"
                              : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-800",
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-4.5 h-4.5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-[10px] md:text-xs font-bold tracking-wider",
                          isActive
                            ? "text-brand-secondary-500"
                            : "text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ) : order.status === "cancelled" ? (
          <Card className="p-8 bg-rose-500/5 border-rose-500/10 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-rose-600">Order Cancelled</h3>
              <p className="text-sm text-rose-500/80">
                This order has been cancelled and is no longer being processed.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-8 bg-brand-secondary-500/5 border-brand-secondary-500/10 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-brand-secondary-500 text-white rounded-full flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-brand-secondary-600">Store Pickup Order</h3>
              <p className="text-sm text-brand-secondary-600/80">
                This order will be collected in store, so delivery tracking is
                not available.
              </p>
            </div>
          </Card>
        )}

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="dark:bg-slate-900 border-none shadow-sm overflow-hidden border">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <h3 className="font-bold flex items-center gap-2 dark:text-white">
                  <ShoppingBag className="w-4 h-4 text-brand-secondary-500" />
                  Package Contents
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {hasOrderItems ? (
                  orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-sm dark:text-white">
                        GH₵{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                    Item details are hidden for this tracking link. Open the
                    original checkout confirmation link or sign in to view full
                    order contents.
                  </div>
                )}
              </div>
              {hasOrderTotal && (
                <div className="p-6 bg-brand-secondary-500/5 border-t border-brand-secondary-500/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Payable
                    </span>
                    <span className="text-xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
                      GH₵{Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5 border-amber-200/70 bg-amber-50/60 dark:bg-amber-500/5 dark:border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Security Recommendation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    For safer access to your order history and easier tracking
                    across devices, create an account and place future orders
                    while signed in.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
                    asChild
                  >
                    <Link href="/signup">Create Account</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <Card className="p-6 dark:bg-slate-900 border-none shadow-sm space-y-6 border">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />{" "}
                  {isStorePickupOrder ? "Pickup Contact" : "Delivery Address"}
                </h4>
                <div className="space-y-1">
                  {shippingInfo ? (
                    <>
                      <p className="text-sm font-bold dark:text-white">
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {isStorePickupOrder ? (
                          <>
                            In-store Pickup
                            <br />
                            {shippingInfo.city}, {shippingInfo.region}
                          </>
                        ) : (
                          <>
                            {shippingInfo.address}
                            <br />
                            {shippingInfo.city}, {shippingInfo.region}
                          </>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Address details are hidden for this tracking link.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Contact Details
                </h4>
                <div className="space-y-2">
                  {shippingInfo ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-brand-secondary-500" />
                        {shippingInfo.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-brand-secondary-500" />
                        {shippingInfo.phone}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Contact details are hidden for this tracking link.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 dark:border-white/10"
                  asChild
                >
                  <Link href="/support">Need Help?</Link>
                </Button>
              </div>
            </Card>            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose">
                Thank you for choosing
                <br />
                <span className="text-brand-secondary-500 font-bold">
                  SHERO TECHNOLOGIES
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Timeline */}
        {(order as any).activityLogs && (order as any).activityLogs.length > 0 && (
          <Card className="p-6 mt-8 dark:bg-slate-900 border shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-200">Detailed Timeline</h3>
            <div className="space-y-0">
              {(order as any).activityLogs.map((log: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-secondary-500 mt-1.5 z-10 shadow shadow-brand-secondary-500/20"></div>
                    {idx < (order as any).activityLogs.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 -mt-2 min-h-12"></div>
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {log.action.replace("order_", "").replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
