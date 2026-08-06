"use client";
import { m } from "motion/react";
import { LockKeyhole, Truck } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shipping,
  tax,
  total,
  itemCount,
  className = ""}) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 ${className}`}
    >
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 text-center">
        Order Summary
      </h3>

      {/* Summary Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-600 dark:text-slate-400 wrap-break-word max-w-[60%]">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            GHS {subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-600 dark:text-slate-400">Shipping</span>
          <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            {shipping === 0 ? "FREE" : `GHS ${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-600 dark:text-slate-400">Tax (VAT)</span>
          <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            GHS {tax.toFixed(2)}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Total
            </span>
            <span className="text-2xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400 whitespace-nowrap">
              GHS {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 place-items-center gap-2">
        <div className="flex items-center gap-1 text-center">
          <Truck className="w-4 h-4 text-brand-secondary-600 dark:text-brand-secondary-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Fast Delivery
          </span>
        </div>
        <div className="flex items-center gap-1 text-center">
          <LockKeyhole className="w-4 h-4 text-brand-secondary-600 dark:text-brand-secondary-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Secure Checkout
          </span>
        </div>
      </div>
    </m.div>
  );
};

export default OrderSummary;
