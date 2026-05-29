"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function CheckoutCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState<
    "loading" | "success" | "pending" | "error"
  >("loading");

  const reference = searchParams.get("reference");
  const readableOrderId = searchParams.get("readableOrderId");

  useEffect(() => {
    if (!reference) {
      setOrderStatus("error");
      return;
    }

    // Fetch order status to confirm payment processing
    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${reference}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          setOrderStatus("error");
          return;
        }

        const data = await res.json();
        if (data.status === "processing" || data.status === "completed") {
          setOrderStatus("success");
        } else if (data.status === "pending") {
          setOrderStatus("pending");
        } else {
          setOrderStatus("error");
        }
      } catch (err) {
        console.error("Failed to fetch order status:", err);
        setOrderStatus("error");
      }
    };

    // Wait 1 second for webhook to process, then check status
    const timer = setTimeout(fetchOrderStatus, 1000);
    return () => clearTimeout(timer);
  }, [reference]);

  if (orderStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Successful
            </h1>
            <p className="text-slate-600 mb-6">
              Thank you for your purchase! Your order{" "}
              <span className="font-mono font-semibold">{readableOrderId}</span>{" "}
              is being processed.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              A confirmation email will be sent shortly with tracking details.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/profile/orders"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
            >
              View Orders
            </Link>
            <Link
              href="/"
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2 px-4 rounded-md transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Pending
            </h1>
            <p className="text-slate-600 mb-6">
              Your payment is still being processed. Please check your email for
              updates.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.refresh()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
            >
              Refresh Status
            </button>
            <Link
              href="/"
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2 px-4 rounded-md transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-slate-600 mb-8">
            We couldn't confirm your payment. Please try again or contact
            support.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/checkout"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
          >
            Try Again
          </Link>
          <Link
            href="/support"
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2 px-4 rounded-md transition"
          >
            Get Help
          </Link>
        </div>
      </div>
    </div>
  );
}
