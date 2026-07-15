"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckCircle,
  Loader,
  XCircle,
  RefreshCw,
  PhoneCall,
} from "lucide-react";
import { trackOrder, type Order } from "@/services/api";
import { useCart } from "@/context/CartContext";
import OrderRatingModal from "@/components/checkout/OrderRatingModal";
import { getOrderAccessToken } from "@/utils/orderAccess";
import { toReadableOrderId } from "@/utils/orderId";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";

const CheckoutSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId") || searchParams.get("reference");

  // Hubtel appends status param when redirecting on cancellation/failure
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
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Retry payment — redirect back to checkout with the same order
  const handleRetryPayment = useCallback(() => {
    if (!orderId) return;
    setIsRetrying(true);
    // Go back to the checkout page so the customer can re-initiate payment
    router.push(`/shop/checkout?retry=${orderId}`);
  }, [orderId, router]);

  // Poll for payment status
  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    // If URL already indicates cancellation/failure, skip polling entirely
    if (isUrlCancelledOrFailed) {
      // Still fetch the order once for display purposes (amount, reference)
      trackOrder(orderId, getOrderAccessToken(orderId) || undefined)
        .then((data) => setOrder(data))
        .catch(() => { }); // Ignore errors — we already know it failed
      return;
    }

    // Clear cart immediately since we have an order ID
    clearCart();

    let attempts = 0;
    let consecutiveErrors = 0;
    const maxAttempts = 30;
    const maxConsecutiveErrors = 5;

    const poll = async () => {
      attempts++;

      // Timeout guard
      if (attempts > maxAttempts) {
        setStatus("pending");
        return;
      }

      try {
        const data = await trackOrder(
          orderId,
          getOrderAccessToken(orderId) || undefined,
        );

        consecutiveErrors = 0;

        // ✅ SUCCESS — payment confirmed
        if (
          data.status === "processing" ||
          data.status === "intransit" ||
          data.status === "delivered"
        ) {
          setOrder(data);
          setStatus("success");
          setTimeout(() => setShowRatingModal(true), 1500);
          return; // Stop polling
        }

        // ❌ FAILED/CANCELLED — detected immediately, no waiting
        if (data.status === "cancelled" || data.status === "failed") {
          setOrder(data);
          setStatus("failed");
          return; // Stop polling
        }

        // Trigger manual verification on the 3rd and 7th attempt as a fallback if webhook is delayed
        if (attempts === 3 || attempts === 7) {
          try {
            const { verifyPayment } = await import("@/services/api");
            // Assuming Hubtel here since Paystack webhooks are typically instant. 
            // We can just pass "hubtel" for now to force a check if it happens to be Hubtel.
            const verifyRes = await verifyPayment(orderId, "hubtel");
            if (verifyRes.success && verifyRes.status === "processing") {
              setOrder({ ...data, status: "processing" });
              setStatus("success");
              setTimeout(() => setShowRatingModal(true), 1500);
              return;
            }
          } catch (err) {
            console.error("Manual verify failed during poll", err);
          }
        }

        // ⏳ Still pending — continue polling
        if (attempts >= maxAttempts) {
          setOrder(data);
          setStatus("pending");
          return; // Stop polling
        }
      } catch (error) {
        consecutiveErrors++;
        if (process.env.NODE_ENV !== "production") {
          console.error("Verification error:", error);
        }
        if (consecutiveErrors >= maxConsecutiveErrors) {
          setStatus("failed");
          return; // Stop polling
        }
      }

      // Adaptive polling: 1s for first 5 attempts, then 2s
      const delay = attempts <= 5 ? 1000 : 2000;
      pollingRef.current = setTimeout(poll, delay);
    };

    // Start first poll quickly (500ms) so fast webhooks are caught immediately
    pollingRef.current = setTimeout(poll, 500);

    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [orderId, router, clearCart, isUrlCancelledOrFailed]);

  if (!orderId) return null;

  const readableOrderId = toReadableOrderId(orderId);
  const whatsappSupportUrl = `https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
    `Hello SHERO, I need help with my order ${readableOrderId}. Can you assist me?`,
  )}`;

  const renderContent = () => {
    // ── VERIFYING ────────────────────────────────────────────────────
    if (status === "verifying") {
      return (
        <div className="py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-brand-secondary-200 border-t-brand-secondary-600 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verifying Payment...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please approve the transaction on your mobile device.
          </p>
        </div>
      );
    }

    // ── PENDING (timeout — webhook not yet received) ─────────────────
    if (status === "pending") {
      return (
        <div className="py-12">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verification Pending
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Your payment verification is taking a little longer than usual.
            If you have already authorized the prompt on your phone, your
            order will be processed shortly.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 mb-1">Order Reference</p>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white break-all mb-4 bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded">
              {readableOrderId}
            </p>
            {order && order.total > 0 && (
              <>
                <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
                  GHS {order.total.toFixed(2)}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4 max-w-md mx-auto mb-6">
            <a
              href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
                `Hello SHERO, I completed payment for order ${readableOrderId} but it's still showing as pending. Can you verify?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold px-8 py-3 rounded bg-[#25D366] text-white hover:bg-[#20bd5a] transition flex items-center justify-center gap-2 shadow-sm"
            >
              <WhatsAppIcon className="w-5 h-5 fill-current" />
              <span>Verify on WhatsApp</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/track/${orderId}`)}
              className="px-8 py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded font-bold transition shadow shadow-brand-secondary-500/20"
            >
              Track Order
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="px-8 py-2 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500 text-slate-700 dark:text-slate-300 rounded font-bold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      );
    }

    // ── FAILED / CANCELLED ───────────────────────────────────────────
    if (status === "failed") {
      return (
        <div className="py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Was Not Completed
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2 max-w-md mx-auto">
            Your payment was not successful. This could happen if the
            transaction was declined, cancelled, or timed out.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
            Don't worry, no money has been deducted from your account.
          </p>

          {/* Order details */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 mb-1">Order Reference</p>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white break-all mb-4 bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded">
              {readableOrderId}
            </p>
            {order && order.total > 0 && (
              <>
                <p className="text-sm text-slate-500 mb-1">Amount</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  GHS {order.total.toFixed(2)}
                </p>
              </>
            )}
          </div>

          {/* Primary actions */}
          <div className="flex flex-col gap-3 max-w-sm mx-auto mb-8">
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full px-8 py-3 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded font-bold transition shadow shadow-brand-secondary-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full px-8 py-2 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500 text-slate-700 dark:text-slate-300 rounded font-bold transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          {/* Support section */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded p-6 max-w-md mx-auto border border-blue-100 dark:border-blue-900/20 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Need help?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              If you believe you were charged or need assistance, our support
              team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[#25D366] text-white font-bold hover:bg-[#128C7E] transition-colors text-sm"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                Chat Support
              </a>
              <a
                href={`tel:${COMPANY_CONTACTS.WHATSAPP}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      );
    }

    // ── SUCCESS ──────────────────────────────────────────────────────
    return (
      <div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-brand-secondary-600 dark:text-brand-secondary-400" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Thank you for your purchase. Your order{" "}
          <span className="font-mono font-bold text-brand-secondary-600">
            {order ? toReadableOrderId(order.id) : readableOrderId}
          </span>{" "}
          has been confirmed.
        </p>

        <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
            GHS{order?.total.toFixed(2)}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 rounded p-6 mb-8 max-w-md mx-auto border border-blue-100 dark:border-blue-900/20 text-left">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What happens next?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            You will receive an email and/or WhatsApp notification shortly with your order details.
            If you need any immediate assistance, feel free to contact us.
          </p>
          <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <p><strong>Call/WhatsApp:</strong> {COMPANY_CONTACTS.WHATSAPP}</p>
            <p><strong>Email:</strong> {COMPANY_EMAILS.SUPPORT}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/track/${orderId}`)}
            className="px-8 py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded font-bold transition shadow shadow-brand-secondary-500/20"
          >
            Track Order
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="px-8 py-2 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500 text-slate-700 dark:text-slate-300 rounded font-bold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center"
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Rating Modal */}
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
