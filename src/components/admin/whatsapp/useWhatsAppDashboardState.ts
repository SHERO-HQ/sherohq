"use client";

import { useState, useEffect } from "react";
import {
  getWhatsAppConfigStatus,
  getWhatsAppAnalytics,
} from "@/app/admin/whatsapp/actions";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDialog } from "@/hooks/useDialog";
import {
  useWhatsAppSupportTickets,
  useWhatsAppRetries,
} from "@/hooks/queries/useAdmin";

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

export interface AnalyticsData {
  dailyData: { date: string; inbound: number; outbound: number }[];
  totals: { inbound: number; outbound: number; failedOutbound: number };
}

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

export function useWhatsAppDashboardState() {
  const prefersReducedMotion = useReducedMotion();
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState("conversations");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Support Tickets States
  const {
    data: ticketsData,
    isLoading: loadingTickets,
    refetch: refetchTickets,
  } = useWhatsAppSupportTickets(activeTab === "support" ? undefined : false);
  const tickets = ticketsData || [];

  // Retries Queue States
  const {
    data: retriesData,
    isLoading: loadingRetries,
    refetch: refetchRetries,
  } = useWhatsAppRetries(activeTab === "retries" ? undefined : false);
  const retries = retriesData || [];
  const [triggeringBulk, setTriggeringBulk] = useState(false);

  // Analytics States
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartType, setChartType] = useState<"composed" | "line" | "bar">(
    "composed",
  );

  // Settings & Test States
  const [testPhone, setTestPhone] = useState("");
  const [testTemplate, setTestTemplate] = useState("verification_code");
  const [testTemplateLang, setTestTemplateLang] = useState("en");
  const [testParams, setTestParams] = useState("");
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then((res) => res.json())
      .then((data) => {
        const t = data.templates || [];
        setDbTemplates(t.filter((x: any) => x.channel === "whatsapp"));
      })
      .catch((err) => console.error("Failed to fetch templates:", err));
  }, []);

  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [testError, setTestError] = useState("");

  const handleUpdateTicketStatus = async (
    ticketId: string,
    newStatus: string,
  ) => {
    try {
      const res = await fetch("/api/admin/whatsapp/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        void refetchTickets();
      } else {
        void dialog.alert({
          title: "Update Failed",
          message: data.error || "Failed to update ticket status",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    try {
      const res = await fetch("/api/admin/whatsapp/retries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", messageId }),
      });
      const data = await res.json();
      if (data.success) {
        void dialog.alert({
          title: "Success",
          message: "Retry triggered successfully!",
          type: "success",
        });
        void refetchRetries();
      } else {
        void dialog.alert({
          title: "Retry Failed",
          message: data.error || "Manual retry failed",
          type: "error",
        });
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
        body: JSON.stringify({ action: "cancel", messageId }),
      });
      const data = await res.json();
      if (data.success) {
        void refetchRetries();
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
        body: JSON.stringify({ action: "retry_all" }),
      });
      const data = await res.json();
      if (data.success) {
        void dialog.alert({
          title: "Bulk Retry Complete",
          message: `Bulk retry complete. Processed: ${data.processed}, Successful: ${data.successful}, Failed: ${data.failed}`,
          type: "success",
        });
        void refetchRetries();
      } else {
        void dialog.alert({
          title: "Bulk Retry Failed",
          message: data.error || "Failed to trigger bulk retries",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringBulk(false);
    }
  };

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
          templateLanguage: testTemplateLang,
          templateParams: testParams
            ? testParams.split(",").map((p) => p.trim())
            : [],
        }),
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

  const [configStatus, setConfigStatus] = useState<{
    hasAccessToken: boolean;
    hasPhoneNumberId: boolean;
    loading: boolean;
  }>({
    hasAccessToken: false,
    hasPhoneNumberId: false,
    loading: true,
  });

  useEffect(() => {
    if (activeTab === "settings") {
      setConfigStatus((prev) => ({ ...prev, loading: true }));
      getWhatsAppConfigStatus()
        .then((status) => {
          setConfigStatus({
            hasAccessToken: status.hasAccessToken,
            hasPhoneNumberId: status.hasPhoneNumberId,
            loading: false,
          });
        })
        .catch((error) => {
          console.error("Failed to fetch WhatsApp config status:", error);
          setConfigStatus((prev) => ({ ...prev, loading: false }));
        });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "analytics") {
      setAnalyticsLoading(true);
      getWhatsAppAnalytics(14)
        .then((data) => {
          setAnalyticsData(data);
          setAnalyticsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch WhatsApp analytics:", error);
          setAnalyticsLoading(false);
        });
    }
  }, [activeTab]);

  return {
    prefersReducedMotion,
    activeTab,
    setActiveTab,
    selectedPhone,
    setSelectedPhone,
    tickets,
    loadingTickets,
    refetchTickets,
    retries,
    loadingRetries,
    refetchRetries,
    triggeringBulk,
    analyticsData,
    analyticsLoading,
    chartType,
    setChartType,
    testPhone,
    setTestPhone,
    testTemplate,
    setTestTemplate,
    setTestTemplateLang,
    testParams,
    setTestParams,
    dbTemplates,
    sendingTest,
    testSuccess,
    testError,
    configStatus,
    handleUpdateTicketStatus,
    handleRetryMessage,
    handleCancelRetry,
    handleRunBulkRetry,
    handleSendTest,
  };
}
