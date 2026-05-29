"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { toReadableOrderId } from "@/utils/orderId";

function CheckoutCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || searchParams.get("orderId");
  const readableOrderIdParam = searchParams.get("readableOrderId");

  const [orderStatus, setOrderStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    if (!reference) {
      setOrderStatus("error");
      return;
    }

    setOrderId(reference);
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2s = 60s timeout

    const fetchOrderStatus = async () => {
      try {
        attempts++;
        const res = await fetch(`/api/orders/track/${reference}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.total) {
            setTotalAmount(data.total);
          }

          if (
            data.status === "processing" ||
            data.status === "completed" ||
            data.status === "shipped" ||
            data.status === "delivered"
          ) {
            setOrderStatus("success");
          } else if (data.status === "pending") {
            if (attempts >= maxAttempts) {
              setOrderStatus("pending"); // Stop polling, but don't show hard error
            } else {
              setOrderStatus("loading"); // keep showing loading/verifying
              setTimeout(fetchOrderStatus, 2000);
            }
          } else {
            setOrderStatus("error");
          }
        } else {
          setOrderStatus("error");
        }
      } catch (err) {
        console.error("Error fetching order status:", err);
        setOrderStatus("error");
      }
    };

    fetchOrderStatus();
  }, [reference]);

  const displayOrderId = readableOrderIdParam || toReadableOrderId(orderId || reference || "");

  const handleWhatsAppConfirm = () => {
    const message = encodeURIComponent(
      `Hello SHERO, I just completed payment for my order!\n\n` +
        `📦 *Order ID:* ${displayOrderId}\n` +
        `💰 *Total:* GHS ${totalAmount > 0 ? totalAmount.toFixed(2) : "Pending"}\n\n` +
        `Please confirm my delivery options. Thank you!`
    );
    window.open(`https://wa.me/233548711582?text=${message}`, "_blank");
  };

  if (orderStatus === "loading") {
    return (
      <div className="text-center py-12">
        <Loader className="w-16 h-16 animate-spin text-brand-secondary-600 dark:text-brand-secondary-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Verifying Payment...
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto px-4">
          We are confirming your payment transaction with the secure gateway. Please do not close this window.
        </p>
      </div>
    );
  }

  if (orderStatus === "pending") {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Verification Pending
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto px-4">
          Your payment verification is taking a little longer than usual. If you have already authorized the prompt on your phone, your order will be processed shortly.
        </p>
        <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Order Reference</p>
          <p className="font-mono text-base font-bold text-slate-900 dark:text-white break-all mb-4 bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded">
            {displayOrderId}
          </p>
          {totalAmount > 0 && (
            <>
              <p className="text-sm text-slate-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
                GHS {totalAmount.toFixed(2)}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Button
            onClick={() => router.push(`/track/${orderId || reference}`)}
            variant="brand"
            className="font-bold px-8"
          >
            Track Order
          </Button>
          <Button
            onClick={() => router.push("/products")}
            variant="outline"
            className="font-bold px-8"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderStatus === "error") {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Verification Failed
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto px-4">
          We could not automatically confirm your payment transaction. If you were charged, don't worry! Your order is saved, and we will verify it manually.
        </p>

        {orderId && (
          <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 mb-1">Please keep this Order ID for support:</p>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white break-all bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded">
              {displayOrderId}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 max-w-md mx-auto mb-8 px-4">
          <button
            onClick={handleWhatsAppConfirm}
            className="font-bold px-8 py-3 rounded bg-[#25D366] text-white hover:bg-[#20bd5a] transition flex items-center justify-center gap-2 shadow-sm"
          >
            <WhatsAppIcon className="w-5 h-5 fill-current" />
            <span>Verify on WhatsApp</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Button
            onClick={() => router.push("/products")}
            variant="outline"
            className="font-bold px-8"
          >
            Return to Shop
          </Button>
          <Button
            onClick={() => router.push("/contact-us")}
            variant="brand"
            className="font-bold px-8"
          >
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-24 h-24 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-brand-secondary-600 dark:text-brand-secondary-400" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Payment Verified!
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto px-4">
        Thank you for your purchase! Your order has been successfully verified and is now being processed.
      </p>

      <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-500 mb-1">Order Reference</p>
        <p className="font-mono text-base font-bold text-brand-secondary-600 mb-4 bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded">
          {displayOrderId}
        </p>
        {totalAmount > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
            <p className="text-3xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
              GHS {totalAmount.toFixed(2)}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto mb-8 px-4">
        <button
          onClick={handleWhatsAppConfirm}
          className="font-bold px-8 py-3 rounded bg-[#25D366] text-white hover:bg-[#20bd5a] transition flex items-center justify-center gap-2 shadow-sm w-full"
        >
          <WhatsAppIcon className="w-5 h-5 fill-current" />
          <span>Confirm on WhatsApp</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
        <Button
          onClick={() => router.push("/products")}
          variant="brand"
          className="font-bold px-8"
        >
          Continue Shopping
        </Button>
        <Button
          onClick={() => router.push(`/track/${orderId || reference}`)}
          variant="outline"
          className="font-bold px-8"
        >
          Track Order
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <Loader className="w-16 h-16 animate-spin text-brand-secondary-600 dark:text-brand-secondary-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Loading...
                </h2>
              </div>
            }
          >
            <CheckoutCompleteContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
