import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { trackOrder, type Order } from "@/services/api";
import { useCart } from "@/context/CartContext";
import OrderRatingModal from "@/components/checkout/OrderRatingModal";
import { useTitle } from "@/hooks/useTitle";

const CheckoutSuccess = () => {
  useTitle("Order Confirmed");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying",
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Poll for payment success
  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    // Clear cart immediately since we have an order ID (assuming success flow start)
    clearCart();

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2s = 60s timeout
    const interval = setInterval(async () => {
      attempts++;
      try {
        const data = await trackOrder(orderId);

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
          // Timeout, but order exists
          clearInterval(interval);
          setOrder(data);
          setStatus("success");
        }
      } catch (error) {
        console.error("Verification error:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, navigate, clearCart]);

  if (!orderId) return null;

  const renderContent = () => {
    if (status === "verifying") {
      return (
        <div className="py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-sora">
            Verifying Payment...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please approve the transaction on your mobile device.
          </p>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="py-12">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-sora">
            Verification Failed
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            We couldn't confirm your payment automatically. Please check your
            order history.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition-colors"
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
          className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white mb-4">
          Payment Verified!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Thank you for your purchase. Your order{" "}
          <span className="font-mono font-bold text-emerald-600">
            #{order?.id.slice(0, 8)}
          </span>{" "}
          has been confirmed.
        </p>

        <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-sora">
            GH₵{order?.total.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-2 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 rounded font-bold transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center"
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
