import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import SEO from "@/components/common/SEO";

const MockPaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {}, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      if (success) {
        globalThis.location.href = `/checkout/success?orderId=${orderId}`;
      } else {
        globalThis.location.href = `/checkout?error=payment_cancelled`; // Redirect back to checkout
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <SEO title="Secure Payment" />
      <div className="bg-white dark:bg-slate-800 rounded shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3">
            <Lock className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-white">SheroTech Secure Pay</h1>
          <p className="text-slate-400 text-sm">Development Mode Simulation</p>
        </div>

        {/* content */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 dark:text-slate-400">
                Order ID:
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {orderId || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">
                Amount:
              </span>
              <span className="text-2xl font-sora font-bold text-emerald-600 dark:text-emerald-400">
                GH₵ {Number.parseFloat(amount || "0").toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handlePayment(true)}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              {isProcessing ? "Processing..." : "Approve Payment"}
            </button>

            <button
              onClick={() => handlePayment(false)}
              disabled={isProcessing}
              className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-2 rounded font-semibold transition-all hover:bg-red-100 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertCircle className="w-5 h-5" />
              Cancel Transaction
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              This is a mock payment page for testing purposes only. No real
              money will be charged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentGateway;
