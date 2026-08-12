"use client";

import { Card } from "@/components/ui/card";

interface ActivityLog {
  action: string;
  details?: string | null;
  createdAt: string;
}

interface TrackActivityLogsProps {
  activityLogs?: ActivityLog[];
}

export function TrackActivityLogs({ activityLogs }: TrackActivityLogsProps) {
  if (!activityLogs || activityLogs.length === 0) return null;

  return (
    <Card className="p-6 mt-8 dark:bg-slate-900 border shadow-sm">
      <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-200">
        Detailed Timeline
      </h3>
      <div className="space-y-0">
        {activityLogs.map((log, idx) => {
          let actionText = log.action
            .replace("order_", "")
            .replace(/_/g, " ")
            .toUpperCase();

          if (log.action === "order_update" && log.details) {
            const match = log.details.match(/status=([\w]+)/i);
            if (match) {
              actionText = `UPDATE: ${match[1].toUpperCase()}`;
            }
          }

          return (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-brand-secondary-500 mt-1.5 z-10 shadow shadow-brand-secondary-500/20" />
                {idx < activityLogs.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 -mt-2 min-h-12" />
                )}
              </div>
              <div className="pb-6">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {actionText}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {new Date(log.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
