"use client";
import React, { useState, useRef } from "react";
import { useVisibleInterval } from "@/hooks/useVisibleInterval";
import { m, AnimatePresence } from "motion/react";

export const POSWidget: React.FC = () => {
  const [posState, setPosState] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useVisibleInterval(
    () => setPosState((prev) => (prev + 1) % 4),
    2800,
    ref,
  );

  const posCycles = [
    { desc: "Scanning Silk Dress", price: "GHS 450.00", badge: "Add Item" },
    { desc: "Loyalty Discount (-10%)", price: "-GHS 45.00", badge: "Discount" },
    { desc: "Processing Paystack API", price: "Syncing...", badge: "Payment" },
    { desc: "Invoice Printed & Sent", price: "GHS 405.00", badge: "Completed" },
  ];

  return (
    <div ref={ref} className="w-full h-36 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 font-mono text-[9px] flex flex-col justify-between select-none z-10">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
          SmartBoutique POS
        </span>
        <span className="text-slate-600 dark:text-slate-400 text-[8px]">
          5 Star Style, Tamale
        </span>
      </div>

      <div className="relative py-2 flex-1 flex flex-col justify-center gap-1">
        <AnimatePresence mode="wait">
          <m.div
            key={posState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                {posCycles[posState].desc}
              </span>
              <span className="inline-flex px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[7px] uppercase font-bold shrink-0">
                {posCycles[posState].badge}
              </span>
            </div>
            <div className="text-[14px] font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              {posCycles[posState].price}
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[7px] text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          Branch Stock Sync
        </span>
        <span>Accra: 142 | Kumasi: 88</span>
      </div>
    </div>
  );
};
