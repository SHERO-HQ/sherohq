"use client";

import React from "react";
import { Loader2, Play, RefreshCw, Clock } from "lucide-react";

export interface RetryRecord {
  id: string;
  message_id: string;
  recipient_phone: string;
  content: string;
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  last_error?: string;
  status: "pending" | "completed" | "cancelled" | "failed";
}

interface WhatsAppRetriesTabProps {
  retries: RetryRecord[];
  loadingRetries: boolean;
  triggeringBulk: boolean;
  refetchRetries: () => void;
  handleRunBulkRetry: () => void;
  handleRetryMessage: (messageId: string) => void;
  handleCancelRetry: (messageId: string) => void;
}

export function WhatsAppRetriesTab({
  retries,
  loadingRetries,
  triggeringBulk,
  refetchRetries,
  handleRunBulkRetry,
  handleRetryMessage,
  handleCancelRetry,
}: WhatsAppRetriesTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions & Bulk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Bulk Recovery
          </h4>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Run the background worker scheduler manually.
          </p>
          <button
            onClick={handleRunBulkRetry}
            disabled={triggeringBulk}
            className="w-full bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground py-2 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {triggeringBulk ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            Run Retry Worker
          </button>
        </div>

        {/* Status breakdown */}
        {["pending", "completed", "cancelled", "failed"].map((status) => {
          const count = retries.filter((r) => r.status === status).length;
          return (
            <div
              key={status}
              className="bg-card/40 border border-border rounded p-6 backdrop-blur-md flex flex-col justify-between"
            >
              <h4 className="text-xs font-bold text-muted-foreground tracking-wider capitalize">
                {status} Retries
              </h4>
              <span className="text-3xl font-extrabold text-foreground mt-4">
                {count}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                records in queue
              </span>
            </div>
          );
        })}
      </div>

      {/* List Table */}
      <div className="bg-card/40 border border-border rounded overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Message Retry Queue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logs of failed broadcast template campaigns and their automated recovery logs.
            </p>
          </div>
          <button
            onClick={() => refetchRetries()}
            disabled={loadingRetries}
            className="text-muted-foreground hover:text-foreground p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRetries ? "animate-spin" : ""}`} />
            Refresh Queue
          </button>
        </div>

        {loadingRetries && retries.length === 0 ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-secondary-500 animate-spin" />
          </div>
        ) : retries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Queue is Empty</p>
            <p className="text-xs">No failed campaign messages require retrying currently.</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-20rem)]">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-card text-muted-foreground text-xs font-bold">
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Recipient</th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Message Content</th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Attempts</th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Next Retry Scheduled</th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Last Error Detail</th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Status</th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-muted-foreground">
                {retries.map((r: RetryRecord) => (
                  <tr key={r.id} className="hover:bg-accent transition-all">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground">
                      {r.recipient_phone}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-muted-foreground text-xs" title={r.content}>
                        {r.content || "(no message text)"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {r.retry_count} / {r.max_retries}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      {r.status === "pending"
                        ? new Date(r.next_retry_at).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 max-w-xs text-xs text-rose-300/80 font-mono truncate">
                      {r.last_error || "none"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          r.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : r.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : r.status === "cancelled"
                                ? "bg-muted text-muted-foreground border-border"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRetryMessage(r.message_id)}
                            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                            title="Retry right now"
                          >
                            Retry Now
                          </button>
                          <button
                            onClick={() => handleCancelRetry(r.message_id)}
                            className="bg-card hover:bg-card border border-border text-muted-foreground hover:text-foreground px-2 py-1 rounded text-xs transition-colors"
                            title="Cancel future attempts"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
