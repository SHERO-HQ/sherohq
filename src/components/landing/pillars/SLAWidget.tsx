"use client";
import React, { useState, useRef } from "react";
import { useVisibleInterval } from "@/hooks/useVisibleInterval";

export const SLAWidget: React.FC = () => {
  const [alertState, setAlertState] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useVisibleInterval(
    () => setAlertState((prev) => (prev + 1) % 4),
    3200,
    ref,
  );

  const alerts = [
    { msg: "System running smoothly", type: "info", tag: "SYS_OK" },
    {
      msg: "ALERT: Port 443 Latency Spike",
      type: "warning",
      tag: "MIT_PENDING"
    },
    {
      msg: "SheroAgent auto-failover bridge routing",
      type: "mitigating",
      tag: "RESOLVING"
    },
    {
      msg: "System stable. Redundant node synced",
      type: "success",
      tag: "RESOLVED"
    },
  ];

  return (
    <div ref={ref} className="w-full h-36 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 font-mono text-[9px] select-none z-10 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
          Shero-SLA Active
        </span>
        <span className="text-slate-700 dark:text-slate-300">
          Uptime: 99.99%
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center py-1">
        <div
          className={`p-2 rounded border transition-all duration-300 ${alertState === 0
              ? "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400"
              : alertState === 1
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                : alertState === 2
                  ? "bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400"
                  : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
              {alerts[alertState].tag}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${alertState === 0
                  ? "bg-slate-700 dark:bg-slate-600"
                  : alertState === 1
                    ? "bg-amber-500 animate-ping"
                    : alertState === 2
                      ? "bg-purple-500 animate-pulse"
                      : "bg-emerald-500"
                }`}
            />
          </div>
          <p className="leading-normal truncate text-[9px] text-slate-700 dark:text-slate-200">
            {alerts[alertState].msg}
          </p>
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[7px] text-slate-700 dark:text-slate-400">
        <span>SLA Ticket dispatch</span>
        <span>Avg Resp: 4.8m</span>
      </div>
    </div>
  );
};
