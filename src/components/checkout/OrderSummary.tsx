import { motion } from "motion/react";
import { CheckCircle, Truck } from "lucide-react";

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
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 ${className}`}
    >
      <h3 className="text-lg font-bold font-sora text-slate-900 dark:text-white mb-6 text-center">
        Order Summary
      </h3>

      {/* Summary Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-600 dark:text-slate-400 break-words max-w-[60%]">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            GH₵{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-600 dark:text-slate-400">Shipping</span>
          <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            {shipping === 0 ? "FREE" : `GH₵${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-600 dark:text-slate-400">Tax (VAT)</span>
          <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            GH₵{tax.toFixed(2)}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-lg font-bold font-sora text-slate-900 dark:text-white">
              Total
            </span>
            <span className="text-2xl font-bold font-sora text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              GH₵{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 place-items-center gap-2">
        <div className="flex items-center gap-2 text-center">
         
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Fast Delivery
          </span>
        </div>
        <div className="flex items-center gap-2 text-center">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Secure Payment
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
