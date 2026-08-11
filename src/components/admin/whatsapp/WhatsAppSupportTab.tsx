"use client";

import React from "react";
import { RefreshCw, Loader2, Ticket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface SupportTicket {
  id: string;
  source: string;
  whatsapp_id?: string;
  customer_phone: string;
  customer_name?: string;
  message: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
}

interface WhatsAppSupportTabProps {
  tickets: SupportTicket[];
  loadingTickets: boolean;
  refetchTickets: () => void;
  handleUpdateTicketStatus: (ticketId: string, newStatus: string) => void;
  setSelectedPhone: (phone: string) => void;
  setActiveTab: (tab: string) => void;
  renderPriority: (priority: string) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
}

export function WhatsAppSupportTab({
  tickets,
  loadingTickets,
  refetchTickets,
  handleUpdateTicketStatus,
  setSelectedPhone,
  setActiveTab,
  renderPriority,
  renderStatusBadge,
}: WhatsAppSupportTabProps) {
  return (
    <div className="bg-card/40 border border-border rounded overflow-hidden backdrop-blur-md">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Consultations & Support Tickets
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tickets created automatically via inbound customer WhatsApp messages.
          </p>
        </div>
        <button
          onClick={() => refetchTickets()}
          disabled={loadingTickets}
          className="text-muted-foreground hover:text-foreground p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loadingTickets && tickets.length === 0 ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-secondary-500 animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">
            No Support Tickets Found
          </p>
          <p className="text-xs">
            No active WhatsApp customer inquiries logged currently.
          </p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[calc(100vh-20rem)]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs font-bold">
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Customer Details</th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Issue Description</th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Priority</th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Status</th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">Date Logged</th>
                <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-muted-foreground">
              {tickets.map((t: SupportTicket) => (
                <tr key={t.id} className="hover:bg-accent transition-all">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">
                      {t.customer_name || "WhatsApp Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {t.customer_phone}
                    </p>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate text-muted-foreground" title={t.message}>
                      {t.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">{renderPriority(t.priority)}</td>
                  <td className="px-6 py-4">{renderStatusBadge(t.status)}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                      className="bg-card border border-border rounded px-2 py-1 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-secondary-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => {
                        setSelectedPhone(t.customer_phone);
                        setActiveTab("conversations");
                      }}
                      className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground px-3 py-1 rounded text-xs font-semibold transition-colors"
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
