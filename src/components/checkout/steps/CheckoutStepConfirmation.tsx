"use client";
import { toReadableOrderId } from "@/utils/orderId";
import React from "react";
import { m } from "motion/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCheckout } from "../CheckoutContext";
import { displayOrderId } from "@/utils/orderId";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { COMPANY_CONTACTS } from "@/constants/contacts";

export default function CheckoutStepConfirmation() {
  const router = useRouter();
  const { formMethods: { watch }, orderId, confirmedTotal } = useCheckout();
  const email = watch("email");

  return (
    <m.div
      key="step4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 sm:p-12 text-center"
    >
      <m.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "tween", ease: "easeOut", duration: 0.5 }}
        className="w-24 h-24 bg-brand-secondary-100 dark:bg-brand-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-12 h-12 text-brand-secondary-600 dark:text-brand-secondary-400" />
      </m.div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Order Confirmed!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Thank you for your order! We've sent a confirmation email to{" "}
        <span className="font-semibold text-brand-secondary-600 dark:text-brand-secondary-400 block sm:inline wrap-break-word">
          {email}
        </span>
      </p>

      <div className="bg-slate-50 dark:bg-slate-950 rounded p-6 mb-8 max-w-md mx-auto">
        {orderId && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Order ID
            </p>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-3 py-2 rounded break-all">
              {toReadableOrderId(orderId || "")}
            </p>
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Order Total
        </p>
        <p className="text-2xl sm:text-4xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400 wrap-break-word">
          GHS {confirmedTotal.toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto mb-8">
        <a
          href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
            `Hello SHERO, I just placed an order! Here are my details:\n\n` +
              `📦 *Order ID:* ${toReadableOrderId(orderId || "")}\n` +
              `💰 *Total:* GHS ${confirmedTotal.toFixed(2)}\n` +
              `👤 *Name:* ${watch("shippingAddress.firstName")} ${watch("shippingAddress.lastName")}\n` +
              `📞 *Phone:* ${watch("phone")}\n\n` +
              `Please confirm my delivery options. Thank you!`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold px-8 py-3 rounded bg-[#25D366] text-white hover:bg-[#20bd5a] transition flex items-center justify-center gap-2 shadow-sm"
        >
          <WhatsAppIcon className="w-5 h-5 fill-current" />
          <span>Confirm on WhatsApp</span>
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => router.push("/products")}
          variant="outline"
          className="font-bold px-8 border-slate-300 dark:border-slate-700"
        >
          Continue Shopping
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="brand"
          className="font-bold px-8"
        >
          Back to Home
        </Button>
      </div>
    </m.div>
  );
}
