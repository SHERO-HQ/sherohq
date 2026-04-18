"use client";
import { motion } from "motion/react";
import {
  AlertCircle,
  RefreshCw,
  Truck,
  Store,
  PhoneCall,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { toReadableOrderId } from "@/utils/orderId";

interface PaymentFailureSupportProps {
  orderId: string;
  amount: number;
  onRetry: () => void;
  onSwitchToOffline: (method: "cod" | "store_pickup") => void;
  isUpdatingOffline?: boolean;
  onBack: () => void;
}

const PaymentFailureSupport = ({
  orderId,
  amount,
  onRetry,
  onSwitchToOffline,
  isUpdatingOffline,
  onBack,
}: PaymentFailureSupportProps) => {
  const WHATSAPP_NUMBER = "233548711582";
  const readableOrderId = toReadableOrderId(orderId);
  const supportMessage = encodeURIComponent(
    `Hello SHERO Support, I'm having trouble completing my payment for Order ${readableOrderId} (GH₵${amount.toFixed(2)}). Can you help me?`,
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${supportMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded border border-red-100 dark:border-red-900/30 overflow-hidden shadow shadow-red-500/5">
        {/* Header Section */}
        <div className="bg-red-50 dark:bg-red-900/10 p-8 text-center border-b border-red-100 dark:border-red-900/20">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Connection Issue
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            We're having trouble connecting to the secure payment gateway right
            now. Your order{" "}
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {readableOrderId}
            </span>{" "}
            has been saved.
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action Group 1: Try Again */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Try Again
              </h3>
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full h-14 justify-between group hover:border-emerald-500 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span>Retry Payment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
              </Button>

              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full h-12 justify-center gap-2 text-slate-400 dark:text-slate-400 dark:hover:text-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Payment Method
              </Button>
            </div>

            {/* Action Group 2: Alternative Options */}
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Alternative Delivery
              </h3>
              <Button
                onClick={() => onSwitchToOffline("cod")}
                disabled={isUpdatingOffline}
                variant="outline"
                className="w-full h-14 justify-between group hover:border-emerald-500 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors">
                    {isUpdatingOffline ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <span>
                    {isUpdatingOffline ? "Processing..." : "Pay on Delivery"}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
              </Button>

              <Button
                onClick={() => onSwitchToOffline("store_pickup")}
                disabled={isUpdatingOffline}
                variant="outline"
                className="w-full h-14 justify-between group hover:border-emerald-500 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors">
                    {isUpdatingOffline ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                  </div>
                  <span>
                    {isUpdatingOffline ? "Processing..." : "Store Pickup"}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
              </Button>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Need expert help?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Our team can process your payment manually or verify your
                  transaction instantly via WhatsApp.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#25D366] text-white font-bold hover:bg-[#128C7E] transition-colors shadow shadow-emerald-500/10"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" />
                  Chat Support
                </a>
                <a
                  href={`tel:${WHATSAPP_NUMBER}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentFailureSupport;
