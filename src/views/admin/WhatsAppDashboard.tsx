"use client";

import React, { useState, useEffect } from "react";
import WhatsAppConversations from "@/components/admin/WhatsAppConversations";
import {
  MessageSquare,
  Ticket,
  BarChart3,
  Clock,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Play,
  X,
  Loader2,
  Check,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDialog } from "@/hooks/useDialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface SupportTicket {
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

interface RetryRecord {
  id: string;
  message_id: string;
  campaign_id: string;
  recipient_phone: string;
  content: string;
  retry_count: number;
  max_retries: number;
  status: "pending" | "completed" | "cancelled" | "failed";
  next_retry_at: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  direction: { direction: string; count: number }[];
  status: { status: string; count: number }[];
  retries: { status: string; count: number }[];
  dailyVolume: { date: string; inbound: number; outbound: number }[];
}

export default function WhatsAppDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState("conversations");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Support Tickets States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Retries Queue States
  const [retries, setRetries] = useState<RetryRecord[]>([]);
  const [loadingRetries, setLoadingRetries] = useState(false);
  const [triggeringBulk, setTriggeringBulk] = useState(false);

  // Analytics States
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Settings States
  const [settings, setSettings] = useState({
    autoRetryEnabled: true,
    maxRetryAttempts: 3,
    retryIntervalMinutes: 15});

  // Settings & Test States
  const [testPhone, setTestPhone] = useState("");
  const [testTemplate, setTestTemplate] = useState("verification_code");
  const [testParams, setTestParams] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [testError, setTestError] = useState("");

  // Load data based on tab active
  useEffect(() => {
    if (activeTab === "support") {
      void fetchTickets();
    } else if (activeTab === "retries") {
      void fetchRetries();
    } else if (activeTab === "analytics") {
      void fetchAnalytics();
    }
  }, [activeTab]);

  // --- Fetch Support Tickets ---
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/admin/whatsapp/support");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/whatsapp/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus })});
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
        );
      } else {
        void dialog.alert({ title: "Update Failed", message: data.error || "Failed to update ticket status", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch Retries Queue ---
  const fetchRetries = async () => {
    setLoadingRetries(true);
    try {
      const res = await fetch("/api/admin/whatsapp/retries");
      const data = await res.json();
      if (data.success) {
        setRetries(data.retries || []);
      }
    } catch (err) {
      console.error("Failed to fetch retry queue:", err);
    } finally {
      setLoadingRetries(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    try {
      const res = await fetch("/api/admin/whatsapp/retries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", messageId })});
      const data = await res.json();
      if (data.success) {
        void dialog.alert({ title: "Success", message: "Retry triggered successfully!", type: "success" });
        void fetchRetries();
      } else {
        void dialog.alert({ title: "Retry Failed", message: data.error || "Manual retry failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelRetry = async (messageId: string) => {
    try {
      const res = await fetch("/api/admin/whatsapp/retries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", messageId })});
      const data = await res.json();
      if (data.success) {
        setRetries((prev) =>
          prev.map((r) => (r.message_id === messageId ? { ...r, status: "cancelled" } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunBulkRetry = async () => {
    setTriggeringBulk(true);
    try {
      const res = await fetch("/api/admin/whatsapp/retries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_all" })});
      const data = await res.json();
      if (data.success) {
        void dialog.alert({ title: "Bulk Retry Complete", message: `Bulk retry complete. Processed: ${data.processed}, Successful: ${data.successful}, Failed: ${data.failed}`, type: "success" });
        void fetchRetries();
      } else {
        void dialog.alert({ title: "Bulk Retry Failed", message: data.error || "Failed to trigger bulk retries", type: "error" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringBulk(false);
    }
  };

  // --- Fetch Analytics ---
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/whatsapp/analytics");
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // --- Send Test Template ---
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;

    setSendingTest(true);
    setTestSuccess(null);
    setTestError("");

    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          templateName: testTemplate,
          templateLanguage: "en",
          templateParams: testParams
            ? testParams.split(",").map((p) => p.trim())
            : []
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestSuccess(true);
        setTestPhone("");
        setTestParams("");
      } else {
        setTestSuccess(false);
        setTestError(data.error || "Meta Graph API rejected message");
      }
    } catch (err: any) {
      setTestSuccess(false);
      setTestError(err.message || String(err));
    } finally {
      setSendingTest(false);
    }
  };

  // Render priority badge
  const renderPriority = (prio: string) => {
    switch (prio) {
      case "urgent":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Urgent</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">Low</span>;
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Open</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Closed</span>;
    }
  };

  const tabs = [
    { id: "conversations", label: "Conversations", icon: MessageSquare },
    { id: "support", label: "WhatsApp Tickets", icon: Ticket },
    { id: "retries", label: "Retry Queue", icon: Clock },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Automation Settings", icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            WhatsApp Automation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage live conversations, track automated delivery retries, resolve customer tickets, and review statistics.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-card/50 p-1 rounded border border-border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded transition-all flex items-center gap-2 ${activeTab === tab.id
              ? "bg-brand-secondary-600 text-white shadow-md shadow-brand-secondary-600/10"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "conversations" && (
          <WhatsAppConversations
            selectedPhone={selectedPhone}
            setSelectedPhone={setSelectedPhone}
          />
        )}

        {activeTab === "support" && (
          <div className="bg-card/40 border border-border rounded overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Consultations & Support Tickets</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tickets created automatically via inbound customer WhatsApp messages.</p>
              </div>
              <button
                onClick={fetchTickets}
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
                <Ticket className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No Support Tickets Found</p>
                <p className="text-xs">No active WhatsApp customer inquiries logged currently.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-card text-muted-foreground text-xs font-bold border-b border-border">
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Issue Description</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date Logged</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-muted-foreground">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-accent transition-all">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">{t.customer_name || "WhatsApp Customer"}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.customer_phone}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="truncate text-muted-foreground" title={t.message}>{t.message}</p>
                        </td>
                        <td className="px-6 py-4">
                          {renderPriority(t.priority)}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(t.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <select
                            value={t.status}
                            onChange={(e) => void handleUpdateTicketStatus(t.id, e.target.value)}
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
                            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
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
        )}

        {activeTab === "retries" && (
          <div className="space-y-6">
            {/* Quick Actions & Bulk Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Bulk Recovery</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Run the background worker scheduler manually.</p>
                <button
                  onClick={handleRunBulkRetry}
                  disabled={triggeringBulk}
                  className="w-full bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white py-2 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {triggeringBulk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Run Retry Worker
                </button>
              </div>

              {/* Status breakdown */}
              {["pending", "completed", "cancelled", "failed"].map((status) => {
                const count = retries.filter((r) => r.status === status).length;
                return (
                  <div key={status} className="bg-card/40 border border-border rounded p-6 backdrop-blur-md flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-muted-foreground tracking-wider capitalize">{status} Retries</h4>
                    <span className="text-3xl font-extrabold text-foreground mt-4">{count}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">records in queue</span>
                  </div>
                );
              })}
            </div>

            {/* List Table */}
            <div className="bg-card/40 border border-border rounded overflow-hidden backdrop-blur-md">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Message Retry Queue</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Logs of failed broadcast template campaigns and their automated recovery logs.</p>
                </div>
                <button
                  onClick={fetchRetries}
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
                  <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">Queue is Empty</p>
                  <p className="text-xs">No failed campaign messages require retrying currently.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-card text-muted-foreground text-xs font-bold border-b border-border">
                        <th className="px-6 py-4">Recipient</th>
                        <th className="px-6 py-4">Message Content</th>
                        <th className="px-6 py-4">Attempts</th>
                        <th className="px-6 py-4">Next Retry Scheduled</th>
                        <th className="px-6 py-4">Last Error Detail</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-muted-foreground">
                      {retries.map((r) => (
                        <tr key={r.id} className="hover:bg-accent transition-all">
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground">
                            {r.recipient_phone}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p className="truncate text-muted-foreground text-xs" title={r.content}>{r.content || "(no message text)"}</p>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {r.retry_count} / {r.max_retries}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                            {r.status === "pending"
                              ? new Date(r.next_retry_at).toLocaleString()
                              : "N/A"
                            }
                          </td>
                          <td className="px-6 py-4 max-w-xs text-xs text-rose-300/80 font-mono truncate">
                            {r.last_error || "none"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${r.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : r.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : r.status === "cancelled"
                                  ? "bg-muted text-muted-foreground border-border"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {r.status === "pending" && (
                              <>
                                <button
                                  onClick={() => void handleRetryMessage(r.message_id)}
                                  className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                                  title="Retry right now"
                                >
                                  Retry Now
                                </button>
                                <button
                                  onClick={() => void handleCancelRetry(r.message_id)}
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
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {loadingAnalytics && !analytics ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-secondary-500 animate-spin" />
              </div>
            ) : !analytics ? (
              <div className="p-6 text-center text-muted-foreground">Failed to load statistics.</div>
            ) : (
              <>
                {/* Visual Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Card 1: Total Messages */}
                  <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Traffic</h4>
                    <div className="flex items-baseline justify-between mt-4">
                      <span className="text-4xl font-extrabold text-foreground">
                        {(analytics.direction.find((d) => d.direction === "inbound")?.count || 0) +
                          (analytics.direction.find((d) => d.direction === "outbound")?.count || 0)}
                      </span>
                      <span className="text-xs text-muted-foreground">messages</span>
                    </div>
                  </div>

                  {/* Card 2: Sent vs Received */}
                  <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Inbound Received</h4>
                    <div className="flex items-baseline justify-between mt-4">
                      <span className="text-4xl font-extrabold text-brand-secondary-400">
                        {analytics.direction.find((d) => d.direction === "inbound")?.count || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(
                          ((analytics.direction.find((d) => d.direction === "inbound")?.count || 0) /
                            (Math.max(1, (analytics.direction.find((d) => d.direction === "inbound")?.count || 0) +
                              (analytics.direction.find((d) => d.direction === "outbound")?.count || 0)))) * 100
                        )}% of total
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Outbound Sent */}
                  <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Outbound Dispatched</h4>
                    <div className="flex items-baseline justify-between mt-4">
                      <span className="text-4xl font-extrabold text-blue-400">
                        {analytics.direction.find((d) => d.direction === "outbound")?.count || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(
                          ((analytics.direction.find((d) => d.direction === "outbound")?.count || 0) /
                            (Math.max(1, (analytics.direction.find((d) => d.direction === "inbound")?.count || 0) +
                              (analytics.direction.find((d) => d.direction === "outbound")?.count || 0)))) * 100
                        )}% of total
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Delivery Rate */}
                  {(() => {
                    const totalOutbound = analytics.direction.find((d) => d.direction === "outbound")?.count || 0;
                    const delivered = analytics.status.find((s) => s.status === "delivered")?.count || 0;
                    const read = analytics.status.find((s) => s.status === "read")?.count || 0;
                    const sent = analytics.status.find((s) => s.status === "sent")?.count || 0;
                    const successful = delivered + read + sent;
                    const successRate = totalOutbound > 0 ? Math.round((successful / totalOutbound) * 100) : 100;
                    return (
                      <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Delivery Rate</h4>
                        <div className="flex items-baseline justify-between mt-4">
                          <span className="text-4xl font-extrabold text-emerald-400">{successRate}%</span>
                          <span className="text-xs text-muted-foreground">success score</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Daily Volume Bar Chart */}
                  <div className="lg:col-span-2 bg-card/40 border border-border rounded p-6 backdrop-blur-md">
                    <h3 className="text-base font-semibold text-foreground mb-6">Daily Messaging Volume</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.dailyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                            itemStyle={{ color: "#3b82f6" }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar dataKey="inbound" name="Inbound" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={!prefersReducedMotion} />
                          <Bar dataKey="outbound" name="Outbound" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={!prefersReducedMotion} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Status Breakdown Pie Chart */}
                  <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md flex flex-col justify-between">
                    <h3 className="text-base font-semibold text-foreground mb-6">Outbound Status Distribution</h3>
                    <div className="h-60 w-full">
                      {analytics.status.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No outbound logs.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.status.map((s) => ({
                                name: s.status,
                                value: s.count,
                                fill: s.status === "read" ? "#22d3ee"
                                  : s.status === "delivered" ? "#10b981"
                                    : s.status === "sent" ? "#3b82f6"
                                      : "#ef4444"
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="#0f172a"
                              strokeWidth={2}
                              isAnimationActive={!prefersReducedMotion}
                            >
                              {analytics.status.map((entry, index) => (
                                <Cell key={`cell-${index}`} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }} />
                            <Legend verticalAlign="bottom" height={36} iconSize={8} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Status Credentials */}
            <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">System Configuration Status</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Verification of Meta credentials defined in the environment parameters.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-card rounded border border-border">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Meta API Token</h5>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">WHATSAPP_ACCESS_TOKEN</p>
                  </div>
                  {process.env.WHATSAPP_ACCESS_TOKEN ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 bg-card rounded border border-border">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Meta Phone Number ID</h5>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">WHATSAPP_PHONE_NUMBER_ID</p>
                  </div>
                  {process.env.WHATSAPP_PHONE_NUMBER_ID ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" /> Configured
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 bg-card rounded border border-border">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Incoming Messages Webhook</h5>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">GET/POST /api/webhooks/whatsapp</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Meta Webhook Target URL</h5>
                <code className="block bg-card p-3 rounded border border-border text-xs text-brand-secondary-400 break-all select-all font-mono">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/webhooks/whatsapp`
                    : "https://yourdomain.com/api/webhooks/whatsapp"}
                </code>
              </div>
            </div>

            {/* Manual Template Test Form */}
            <div className="bg-card/40 border border-border rounded p-6 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Dispatch Test Template</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Send an approved transactional message template to verify API connectivity.</p>
              </div>

              <form onSubmit={handleSendTest} className="space-y-4 my-6">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1" htmlFor="test-phone-number">
                    Recipient Phone Number (with country code, e.g. +23354XXXXXXX)
                  </label>
                  <input
                    id="test-phone-number"
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+233541234567"
                    required
                    className="w-full px-4 py-2.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1" htmlFor="test-template-name">
                      Template Name
                    </label>
                    <input
                      id="test-template-name"
                      type="text"
                      value={testTemplate}
                      onChange={(e) => setTestTemplate(e.target.value)}
                      placeholder="verification_code"
                      required
                      className="w-full px-4 py-2.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1" htmlFor="test-template-params">
                      Parameters (CSV)
                    </label>
                    <input
                      id="test-template-params"
                      type="text"
                      value={testParams}
                      onChange={(e) => setTestParams(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-2.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Test Template
                </button>
              </form>

              {/* Status Banner */}
              {testSuccess === true && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  Test template message dispatched successfully! Check logs.
                </div>
              )}
              {testSuccess === false && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded flex items-start gap-2">
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Dispatch failed</p>
                    <p className="mt-0.5 text-rose-300 font-mono text-[10px] break-all">{testError}</p>
                  </div>
                </div>
              )}
              {testSuccess === null && <div className="h-10" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
