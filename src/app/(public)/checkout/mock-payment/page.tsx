"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, ShieldAlert, Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toReadableOrderId } from "@/utils/orderId";

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const provider = searchParams.get("provider") || "unknown";

  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Fetch order details so we can render them in the simulator
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/track/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.total) {
            setOrderTotal(data.total);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order details in simulator:", err);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleSimulate = async (success: boolean) => {
    if (!orderId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (success) {
        // Send a simulated Hubtel webhook request to the backend to update order status to processing
        const res = await fetch("/api/payments/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ClientReference: orderId,
            Status: "Success",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to process simulation on server");
        }

        // Redirect to complete page
        router.push(`/checkout/complete?reference=${orderId}&readableOrderId=${toReadableOrderId(orderId)}`);
      } else {
        // Redirect to complete page with no webhook success (this triggers verification failure/support view)
        router.push(`/checkout/complete?reference=${orderId}&readableOrderId=${toReadableOrderId(orderId)}`);
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setErrorMessage("Failed to simulate transaction. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!orderId) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Invalid Simulator Session
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Missing the required order identifier to initialize the payment simulator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Developer Sandbox Mode
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Secure Payment Simulator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Choose a payment outcome to simulate the transaction state machine.
        </p>
      </div>

      {/* Simulator Details Card */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-6 text-left space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            {toReadableOrderId(orderId)}
          </span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway Provider</span>
          <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
            {provider}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulated Total</span>
          <span className="text-lg font-black text-brand-secondary-600 dark:text-brand-secondary-400">
            GHS {orderTotal > 0 ? orderTotal.toFixed(2) : "Fetching..."}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Simulation Buttons */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleSimulate(true)}
          disabled={isProcessing}
          className="flex flex-col items-center justify-center p-6 border-2 border-emerald-500/20 hover:border-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20 text-emerald-600 dark:text-emerald-400 rounded transition-all duration-300 group shadow-sm disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-bold text-base">Simulate Success</span>
          <span className="text-xs opacity-75 mt-1 text-center leading-snug">
            Triggers a database update via webhooks to mark order as processing.
          </span>
        </button>

        <button
          onClick={() => handleSimulate(false)}
          disabled={isProcessing}
          className="flex flex-col items-center justify-center p-6 border-2 border-rose-500/20 hover:border-rose-500 bg-rose-50/10 hover:bg-rose-50/20 text-rose-600 dark:text-rose-400 rounded transition-all duration-300 group shadow-sm disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <span className="font-bold text-base">Simulate Failure</span>
          <span className="text-xs opacity-75 mt-1 text-center leading-snug">
            Leaves order as pending, forcing checkout error & support options.
          </span>
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose">
          This interface is strictly for sandbox testing.
          <br />
          No real money or details are processed.
        </p>
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-16">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 animate-pulse text-brand-secondary-600 dark:text-brand-secondary-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Initializing Sandbox...
                </h2>
              </div>
            }
          >
            <MockPaymentContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
