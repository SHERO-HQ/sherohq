"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
  TruckElectric,
  ShoppingBag,
} from "lucide-react";
import { trackOrder, type Order } from "@/services/api";
import { useCart } from "@/context/CartContext";
import OrderRatingModal from "@/components/checkout/OrderRatingModal";
import { getOrderAccessToken } from "@/utils/orderAccess";
import { displayOrderId } from "@/utils/orderId";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { supabase } from "@/lib/supabase";
import { getPaymentVerificationState } from "@/lib/paymentStatus";
import { cn } from "@/lib/utils";

const CheckoutSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId") || searchParams.get("reference");

  const urlStatus = searchParams.get("status");
  const isUrlCancelledOrFailed =
    urlStatus?.toLowerCase() === "cancelled" ||
    urlStatus?.toLowerCase() === "canceled" ||
    urlStatus?.toLowerCase() === "failed";

  const [status, setStatus] = useState<
    "verifying" | "success" | "pending" | "failed"
  >(isUrlCancelledOrFailed ? "failed" : "verifying");
  const [order, setOrder] = useState<Order | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const [loadingText, setLoadingText] = useState("Connecting to payment gateway...");

  const handleRetryPayment = useCallback(() => {
    if (!orderId) return;
    setIsRetrying(true);
    router.push(`/shop/checkout?retry=${orderId}`);
  }, [orderId, router]);

  // Simulated Progress Text
  useEffect(() => {
    if (status !== "verifying" && status !== "pending") return;
    const messages = [
      "Connecting to payment gateway...",
      "Confirming transaction status...",
      "Verifying payment response...",
      "Finalizing order confirmation...",
    ];
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    // Initial fetch
    trackOrder(orderId, getOrderAccessToken(orderId) || undefined)
      .then((data) => {
        setOrder(data);
        const verificationState = getPaymentVerificationState({
          success: true,
          paymentStatus: data.paymentStatus,
          status: data.status,
          verified:
            data.status === "processing" ||
            data.status === "intransit" ||
            data.status === "delivered",
        });

        if (verificationState.status === "processing") {
          setStatus("success");
          setTimeout(() => setShowRatingModal(true), 1500);
        } else if (verificationState.status === "failed") {
          setStatus("failed");
        } else if (isUrlCancelledOrFailed) {
          setStatus("failed");
        } else {
          // Move from initial verifying to pending view if transaction status is pending
          setStatus("pending");
        }
      })
      .catch(() => {
        console.error("[CheckoutSuccess] Initial order fetch failed for:", orderId);
        if (isUrlCancelledOrFailed) setStatus("failed");
      });

    if (isUrlCancelledOrFailed) return;
    clearCart();
  }, [orderId, router, clearCart, isUrlCancelledOrFailed]);

  // Supabase Realtime for instant webhook updates (uses resolved UUID)
  useEffect(() => {
    if (!order?.id || isUrlCancelledOrFailed) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload: any) => {
          const newStatus = payload.new.status;
          if (newStatus) {
            if (
              newStatus === "processing" ||
              newStatus === "intransit" ||
              newStatus === "delivered"
            ) {
              setStatus("success");
              setTimeout(() => setShowRatingModal(true), 1500);
            } else if (newStatus === "cancelled" || newStatus === "failed") {
              setStatus("failed");
            } else {
              setStatus("pending");
            }
            setOrder((prev) =>
              prev ? ({ ...prev, status: newStatus } as Order) : prev,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, isUrlCancelledOrFailed]);

  // Fallback verification if order stays pending and webhook fails
  useEffect(() => {
    if (status !== "pending" && status !== "verifying") return;
    if (!order?.id || isUrlCancelledOrFailed) return;

    let attempts = 0;
    const maxAttempts = 12; // Poll for about 48 seconds
    const interval = setInterval(() => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        if (status === "verifying") {
          setStatus("pending");
        }
        return;
      }

      // Offline payment methods don't need provider verification polling
      if (!(["momo", "card"].includes(order.paymentMethod))) {
        clearInterval(interval);
        return;
      }

      const provider = order.paymentMethod === "card" ? "paystack" : "hubtel";
      const orderAccessToken = getOrderAccessToken(order.id);
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "X-CSRF-Protection": "1",
      };

      if (orderAccessToken) {
        headers["X-Order-Access-Token"] = orderAccessToken;
      }

      fetch("/api/payments/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId: order.id, provider }),
      })
        .then((res) => res.json())
        .then((data) => {
          const verificationState = getPaymentVerificationState(data);
          if (verificationState.status === "processing") {
            setStatus("success");
            setOrder((prev) =>
              prev
                ? ({
                  ...prev,
                  status: data.status || "processing",
                  paymentStatus: verificationState.paymentStatus,
                } as Order)
                : prev,
            );
            setTimeout(() => setShowRatingModal(true), 1500);
            clearInterval(interval);
          } else if (verificationState.status === "failed") {
            setStatus("failed");
            setOrder((prev) =>
              prev
                ? ({
                  ...prev,
                  // A declined payment keeps the order pending for retry.
                  paymentStatus: verificationState.paymentStatus,
                } as Order)
                : prev,
            );
            clearInterval(interval);
          }
        })
        .catch((err) => {
          console.error("Verification fallback error:", err);
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [status, order?.id, order?.paymentMethod, isUrlCancelledOrFailed]);

  if (!orderId) return null;
  const readableOrderId = displayOrderId(orderId);

  // Dynamic Branding
  const getBrandColors = () => {
    const method = order?.paymentMethod?.toLowerCase() || "";
    if (method.includes("mtn")) {
      return {
        ring: "bg-amber-500/20",
        border: "border-amber-500/30",
        iconBg: "bg-amber-50 dark:bg-amber-500/10",
        iconText: "text-amber-600 dark:text-amber-400",
        pulse: "bg-amber-500",
        glow: "via-amber-500/20",
      };
    }
    if (
      method.includes("vodafone") ||
      method.includes("telecel") ||
      method.includes("airtel") ||
      method.includes("tigo")
    ) {
      return {
        ring: "bg-red-500/20",
        border: "border-red-500/30",
        iconBg: "bg-red-50 dark:bg-red-500/10",
        iconText: "text-red-600 dark:text-red-400",
        pulse: "bg-red-500",
        glow: "via-red-500/20",
      };
    }
    // Default (Emerald / Generic)
    return {
      ring: "bg-emerald-500/20",
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconText: "text-emerald-600 dark:text-emerald-400",
      pulse: "bg-emerald-500",
      glow: "via-emerald-500/20",
    };
  };

  const brand = getBrandColors();

  const confirmationState =
    status === "failed"
      ? {
        heading: "Payment Failed",
        description:
          "Your payment could not be completed. Please try again or contact support.",
        badge: "Failed",
        badgeClassName:
          "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
      }
      : {
        heading: "Payment Successful",
        description:
          "Your payment was successful and your order is confirmed.",
        badge: "Success",
        badgeClassName:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      };

  const renderContent = () => {
    if (status === "verifying") {
      return (
        <div className="py-16 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className={`absolute inset-0 ${brand.ring} rounded-full`}
            />
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 1,
              }}
              className={`absolute inset-0 ${brand.ring} rounded-full`}
            />
            <div
              className={`w-16 h-16 ${brand.iconBg} rounded-full flex items-center justify-center z-10 border border-slate-100 dark:border-slate-800`}
            >
              <ShieldCheck className={`w-7 h-7 ${brand.iconText}`} />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 border border-dashed ${brand.border} rounded-full`}
            />
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">
            Confirming Your Payment
          </h2>
          <div className="h-6 overflow-hidden mb-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-slate-500 dark:text-slate-400 text-sm font-medium"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-70 mx-auto text-center leading-relaxed">
            Please wait while we confirm your payment details with the gateway.
          </p>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="py-8 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/50 rounded flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 text-center tracking-tight">
            Processing Transfer
          </h2>
          <div className="h-6 overflow-hidden mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-slate-500 dark:text-slate-400 text-sm font-medium"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="w-full bg-white dark:bg-[#0f1115] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded p-8 mb-8 border border-slate-100 dark:border-slate-800/60 relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent ${brand.glow} to-transparent`}
            />

            <div className="flex flex-col items-center mb-10">
              <span className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                Total Amount
              </span>
              {order && order.total > 0 ? (
                <div className="flex items-start gap-1">
                  <span className="text-lg font-medium text-slate-400 mt-1">
                    GHS
                  </span>
                  <span className="text-5xl font-light tracking-tight text-slate-900 dark:text-white">
                    {order.total.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              )}
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 text-sm font-medium">To</span>
                <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">
                  Shero Technologies
                </span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 text-sm font-medium">
                  Ref ID
                </span>
                <span className="text-slate-900 dark:text-slate-100 text-sm font-mono">
                  {readableOrderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">
                  Network
                </span>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${brand.pulse} animate-pulse`}
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Authorizing
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <a
              href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
                `Hello SHERO, my transfer for order ${readableOrderId} is still authorizing. Can you check?`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-6 py-4 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                <span className="font-semibold text-sm">Contact Support</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={() => router.push(`/track/${orderId}`)}
              className="w-full flex items-center justify-between px-6 py-4 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                </div>
                <span className="font-semibold text-sm">
                  Track Status Later
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="py-8 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full"
            />
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400 z-10" />
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 text-center tracking-tight">
            Transfer Failed
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-center text-sm leading-relaxed px-4">
            Your transaction was declined or timed out. No funds were deducted.
          </p>

          <div className="w-full bg-white dark:bg-[#0f1115] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded p-8 mb-8 border border-slate-100 dark:border-slate-800/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-red-500/20 to-transparent" />

            <div className="flex flex-col items-center mb-10">
              <span className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                Attempted Amount
              </span>
              {order && order.total > 0 ? (
                <div className="flex items-start gap-1">
                  <span className="text-lg font-medium text-slate-400 mt-1">
                    GHS
                  </span>
                  <span className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {order.total.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
              )}
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 text-sm font-medium">
                  Ref ID
                </span>
                <span className="text-slate-900 dark:text-slate-100 text-sm font-mono">
                  {readableOrderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">
                  Status
                </span>
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-full">
                  <span className="text-red-700 dark:text-red-400 text-xs font-semibold uppercase tracking-wide">
                    Failed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold transition-colors disabled:opacity-60"
            >
              {isRetrying ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span>{isRetrying ? "Redirecting..." : "Try Again"}</span>
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full flex items-center justify-center px-6 py-4 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="py-8 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute inset-0 bg-emerald-500 rounded-full"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          >
            <Check className="w-12 h-12 text-white z-10 stroke-3" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 text-center tracking-tight">
          {confirmationState.heading}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-center text-sm leading-relaxed px-4">
          {confirmationState.description}
        </p>

        <div className="w-full bg-white dark:bg-[#0f1115] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded p-8 mb-8 border border-slate-100 dark:border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="flex flex-col items-center mb-10">
            <span className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
              Amount Paid
            </span>
            {order && order.total > 0 ? (
              <div className="flex items-start gap-1">
                <span className="text-lg font-medium text-slate-400 mt-1">
                  GHS
                </span>
                <span className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {order.total.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
            )}
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 text-sm font-medium">Ref ID</span>
              <span className="text-slate-900 dark:text-slate-100 text-sm font-mono">
                {readableOrderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm font-medium">Status</span>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded",
                  confirmationState.badgeClassName,
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {confirmationState.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={() => router.push(`/track/${orderId}`)}
            className="w-full flex items-center justify-between px-6 py-4 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center">
                <TruckElectric className="w-3 h-3" />
              </div>
              <span className="font-semibold text-sm">Track My Order</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/shop")}
            className="w-full flex items-center justify-center px-6 py-4 rounded bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-8 pb-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          {renderContent()}
        </motion.div>
      </div>

      {orderId && (
        <OrderRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          orderId={orderId}
        />
      )}
    </div>
  );
};

export default CheckoutSuccess;
