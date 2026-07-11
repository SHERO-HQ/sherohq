"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
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

  const [status, setStatus] = useState<"verifying" | "success" | "pending" | "failed">(
    "verifying",
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Poll for payment success
  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    // Clear cart immediately since we have an order ID (assuming success flow start)
    clearCart();

    let attempts = 0;
    let consecutiveErrors = 0;
    const maxAttempts = 30; // 30 attempts * 2s = 60s timeout
    const maxConsecutiveErrors = 5; // Give up after 5 straight failures

    const interval = setInterval(async () => {
      attempts++;

      // Timeout guard — runs even if trackOrder throws every time
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setStatus("pending");
        return;
      }

      try {
        const data = await trackOrder(
          orderId,
          getOrderAccessToken(orderId) || undefined,
        );

        consecutiveErrors = 0; // reset on success

        // Check if paid/processing
        if (
          data.status === "processing" ||
          data.status === "shipped" ||
          data.status === "delivered"
        ) {
          clearInterval(interval);
          setOrder(data);
          setStatus("success");
          // Open rating modal after a short delay
          setTimeout(() => setShowRatingModal(true), 1500);
        } else if (attempts >= maxAttempts) {
          // Timeout — order exists but payment not yet confirmed by webhook
          clearInterval(interval);
          setOrder(data);
          setStatus("pending");
        }
      } catch (error) {
        consecutiveErrors++;
        if (process.env.NODE_ENV !== "production") {
          console.error("Verification error:", error);
        }
        // If the API is consistently failing, stop and show error
        if (consecutiveErrors >= maxConsecutiveErrors) {
          clearInterval(interval);
          setStatus("failed");
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, router, clearCart]);

  if (!orderId) return null;

  const renderContent = () => {
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
              {toReadableOrderId(orderId)}
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
                `Hello SHERO, I completed payment for order ${toReadableOrderId(orderId)} but it's still showing as pending. Can you verify?`
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

    if (status === "failed") {
      return (
        <div className="py-12">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verification Failed
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            We couldn't confirm your payment automatically. Please check your
            order history.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="px-8 py-2 bg-brand-secondary-600 text-white rounded font-bold hover:bg-brand-secondary-700 transition-colors"
          >
            Return to Shop
          </button>
        </div>
      );
    }

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
          Payment Verified!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Thank you for your purchase. Your order{" "}
          <span className="font-mono font-bold text-brand-secondary-600">
            {order ? toReadableOrderId(order.id) : "ORD-UNKNOWN"}
          </span>{" "}
          has been confirmed.
        </p>

        <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
            GHS {order?.total.toFixed(2)}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 rounded p-6 mb-8 max-w-md mx-auto border border-blue-100 dark:border-blue-900/20 text-left">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What happens next?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            You will receive an email and WhatsApp notification shortly with your order details. 
            If you need any immediate assistance, feel free to contact us.
          </p>
          <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <p><strong>Call/WhatsApp:</strong> {COMPANY_CONTACTS.WHATSAPP}</p>
            <p><strong>Email:</strong> {COMPANY_EMAILS.SUPPORT}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/shop")}
            className="px-8 py-2 bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded font-bold transition shadow shadow-brand-secondary-500/20"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-2 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-secondary-500 dark:hover:border-brand-secondary-500 text-slate-700 dark:text-slate-300 rounded font-bold transition-colors"
          >
            Return Home
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
