"use client";
import React, { useState, useRef } from "react";
import { useVisibleInterval } from "@/hooks/useVisibleInterval";
import { Database, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export const PharmasystWidget: React.FC = () => {
  const [stockCycle, setStockCycle] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useVisibleInterval(
    () => setStockCycle((prev) => (prev + 1) % 2),
    4000,
    ref,
  );

  return (
    <div ref={ref} className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 font-mono text-[9px] flex flex-col md:flex-row gap-4 select-none z-10">
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            Pharmasyst ERP Ledger
          </span>
          <span className="text-[8px] text-slate-600 dark:text-slate-400">
            Active Inventory
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="grid grid-cols-[2fr_1fr_1fr] text-[7px] text-slate-700 dark:text-slate-400 uppercase pb-1 border-b border-slate-300/35 dark:border-slate-800/35">
            <span>Pharmaceutical</span>
            <span className="text-center">Stock</span>
            <span className="text-right">FDA Compliance</span>
          </div>

          {[
            { name: "Amoxicillin (500mg)", qty: 1240, alert: false },
            {
              name: "Paracetamol (500mg)",
              qty: stockCycle === 0 ? 210 : 800,
              alert: stockCycle === 0
            },
            { name: "Ibuprofen (400mg)", qty: 880, alert: false },
            {
              name: "Ciprofloxacin (500)",
              qty: stockCycle === 0 ? 90 : 450,
              alert: stockCycle === 0
            },
          ].map((item) => (
            <div
              key={item.name}
              className={`grid grid-cols-[2fr_1fr_1fr] items-center py-0.5 border-b border-slate-300/10 dark:border-slate-800/10 transition-colors duration-300 ${item.alert
                  ? "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 font-semibold"
                  : "text-slate-700 dark:text-slate-400"
                }`}
            >
              <span className="truncate">{item.name}</span>
              <span className="text-center">{item.qty} units</span>
              <span className="text-right flex items-center justify-end gap-1">
                {item.alert ? (
                  <>
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Auto-Order
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                    Passed
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-300 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Health Authority Link
            </span>
          </div>

          <div className="p-2.5 rounded bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-400 text-[8px] flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200 dark:text-slate-100 text-[9px] mb-0.5">
                FDA/Pharmacy Council
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Live Secure Gateway Sync
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400">100%</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="p-2 rounded bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 text-amber-400/90 text-[7px] leading-normal flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Batch #FDA-401B Expiry Warning: Auto-Quarantined and flagged in
              vendor portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
