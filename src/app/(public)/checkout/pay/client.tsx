"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Lock,
  CreditCard,
  Smartphone,
  AlertCircle,
  Clock,
  CheckCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { trackOrder, initializePayment, type Order } from "@/services/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toReadableOrderId } from "@/utils/orderId";
import { cn } from "@/lib/utils";

type PaymentMethod = "momo" | "card";

export default function DynamicPaymentPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const token = searchParams.get("token") || undefined;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("momo");
  const [isPending, startTransition] = useTransition();
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No order identifier provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await trackOrder(orderId, token);
        setOrder(data);
        setError(null);

        // Pre-select payment method if already saved on the order
        if (data.paymentMethod === "card") {
          setSelectedMethod("card");
        } else {
          setSelectedMethod("momo");
        }
      } catch (err) {
        console.error("Payment portal error loading order:", err);
        setError(
          "We couldn't retrieve the payment details. Please verify your payment link."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  const handleProcessPayment = () => {
    if (!order) return;

    startTransition(async () => {
      try {
        const provider = selectedMethod === "card" ? "paystack" : "hubtel";
        const paymentResponse = await initializePayment(
          order.id,
          order.total,
          `Service Payment for Order ${toReadableOrderId(order.id)}`,
          provider
        );

        if (paymentResponse.success && paymentResponse.checkoutUrl) {
          window.location.href = paymentResponse.checkoutUrl;
        } else {
          setError(
            "We were unable to open the secure payment channel. Please try again or choose another method."
          );
        }
      } catch (err) {
        console.error("Payment portal initialization failure:", err);
        setError(
          "The secure payment gateway is currently busy. Please verify your connection or try again."
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950 p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-secondary-500/20 border-t-brand-secondary-500 rounded-full animate-spin" />
          <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary-500" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Establishing encrypted connection...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Connection Issue
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error || "This checkout link has expired or is invalid."}
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            router.refresh();
          }}
          variant="outline"
          className="border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
        >
          Try Reloading
        </Button>
      </div>
    );
  }

  const readableId = toReadableOrderId(order.id);
  const total = order.total;
  const billingInfo = order.shippingInfo;

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      {/* Top Brand Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <span className="font-logo-next text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Shero
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400 border border-brand-secondary-500/20">
            Secure Portal
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Official Merchant Payment Gateway
        </p>
      </div>

      {/* Main Payment Card */}
      <div className="w-full max-w-md my-8">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-secondary-500/2 rounded-full blur-3xl pointer-events-none" />

          {/* Amount Summary */}
          <div className="text-center pb-6 border-b border-slate-100 dark:border-white/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Amount to Pay
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-secondary-600 dark:text-brand-secondary-400 font-mono">
              GHS {total.toFixed(2)}
            </h2>
            <div className="inline-flex items-center gap-1.5 mt-3 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Inv: {readableId}</span>
            </div>
          </div>

          {/* Billing Info Summary */}
          <div className="py-5 space-y-3 text-xs border-b border-slate-100 dark:border-white/5">
            <div className="flex justify-between">
              <span className="text-slate-400">Customer</span>
              <span className="font-semibold text-slate-800 dark:text-white">
                {billingInfo.firstName} {billingInfo.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email Address</span>
              <span className="font-mono text-slate-800 dark:text-white">
                {billingInfo.email}
              </span>
            </div>
            {billingInfo.phone && (
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-mono text-slate-800 dark:text-white">
                  {billingInfo.phone}
                </span>
              </div>
            )}

            {/* Collapsible Invoice Items */}
            {order.items && order.items.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowItems(!showItems)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-wider"
                >
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    {showItems ? "Hide" : "Show"} Invoice Details
                  </span>
                  {showItems ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showItems && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg space-y-2.5 max-h-44 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400"
                      >
                        <span className="truncate pr-4">
                          {item.name} <span className="opacity-60">x{item.quantity}</span>
                        </span>
                        <span className="font-mono shrink-0">
                          GHS {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="py-6 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Select Payment Method
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* MOMO Selection */}
              <button
                type="button"
                onClick={() => setSelectedMethod("momo")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                  selectedMethod === "momo"
                    ? "border-brand-secondary-500 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                    selectedMethod === "momo"
                      ? "bg-brand-secondary-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Mobile Money</p>
                  <p className="text-[9px] opacity-70">MTN / Telecel Cash</p>
                </div>
              </button>

              {/* CARD Selection */}
              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                  selectedMethod === "card"
                    ? "border-brand-secondary-500 bg-brand-secondary-500/5 dark:bg-brand-secondary-500/10 text-brand-secondary-600 dark:text-brand-secondary-400"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                    selectedMethod === "card"
                      ? "bg-brand-secondary-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Credit / Debit Card</p>
                  <p className="text-[9px] opacity-70">Visa / Mastercard</p>
                </div>
              </button>
            </div>
          </div>

          {/* Secure Button */}
          <Button
            onClick={handleProcessPayment}
            disabled={isPending}
            variant="brand"
            className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-secondary-500/20"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay GHS {total.toFixed(2)} Securely</span>
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Branded Trust Badge Footer */}
      <div className="flex flex-col items-center gap-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Secured by Paystack & Hubtel</span>
        </div>
        <p className="max-w-xs leading-relaxed opacity-80">
          Your credentials are fully tokenized and processed over a 256-bit SSL encrypted connection. No sensitive billing records are stored locally.
        </p>
      </div>
    </div>
  );
}
