"use client";

import WhatsAppConversations from "@/components/admin/WhatsAppConversations";
import { WhatsAppSupportTab } from "@/components/admin/whatsapp/WhatsAppSupportTab";
import { WhatsAppRetriesTab } from "@/components/admin/whatsapp/WhatsAppRetriesTab";
import { WhatsAppAnalyticsTab } from "@/components/admin/whatsapp/WhatsAppAnalyticsTab";
import { WhatsAppSettingsTab } from "@/components/admin/whatsapp/WhatsAppSettingsTab";
import {
  MessageSquare,
  Ticket,
  BarChart3,
  Clock,
  Settings,
  MessageSquareCode,
} from "lucide-react";
import { useWhatsAppDashboardState } from "@/components/admin/whatsapp/useWhatsAppDashboardState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function WhatsAppDashboard() {
  const {
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
  } = useWhatsAppDashboardState();

  const renderPriority = (prio: string) => {
    switch (prio) {
      case "urgent":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            Low
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Closed
          </span>
        );
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
      {/* Sticky Header and Tab Bar */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md pt-4 pb-4 border-b border-border shadow-sm mb-6 -mx-3 px-3 md:-mx-6 md:px-6">
        <AdminPageHeader
          icon={MessageSquareCode}
          title="WhatsApp Automation"
          description="Manage live conversations, track automated delivery retries, resolve customer tickets, and review statistics."
          sticky={false}
        />

        {/* Tabs Menu */}
        <div>
          {/* Mobile Dropdown */}
          <div className="sm:hidden">
            <label htmlFor="mobile-tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="mobile-tabs"
              name="mobile-tabs"
              className="block w-full bg-transparent border border-border rounded text-foreground focus:ring-brand-secondary-500 focus:border-brand-secondary-500 py-3 px-4 text-sm shadow-sm"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex bg-card/50 p-1 rounded border border-border w-fit">
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
        </div>
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
          <WhatsAppSupportTab
            tickets={tickets}
            loadingTickets={loadingTickets}
            refetchTickets={refetchTickets}
            handleUpdateTicketStatus={handleUpdateTicketStatus}
            setSelectedPhone={setSelectedPhone}
            setActiveTab={setActiveTab}
            renderPriority={renderPriority}
            renderStatusBadge={renderStatusBadge}
          />
        )}

        {activeTab === "retries" && (
          <WhatsAppRetriesTab
            retries={retries}
            loadingRetries={loadingRetries}
            triggeringBulk={triggeringBulk}
            refetchRetries={refetchRetries}
            handleRunBulkRetry={handleRunBulkRetry}
            handleRetryMessage={handleRetryMessage}
            handleCancelRetry={handleCancelRetry}
          />
        )}

        {activeTab === "analytics" && (
          <WhatsAppAnalyticsTab
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
            chartType={chartType}
            setChartType={setChartType}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {activeTab === "settings" && (
          <WhatsAppSettingsTab
            configStatus={configStatus}
            handleSendTest={handleSendTest}
            testPhone={testPhone}
            setTestPhone={setTestPhone}
            testTemplate={testTemplate}
            setTestTemplate={setTestTemplate}
            setTestTemplateLang={setTestTemplateLang}
            testParams={testParams}
            setTestParams={setTestParams}
            dbTemplates={dbTemplates}
            sendingTest={sendingTest}
            testSuccess={testSuccess}
            testError={testError}
          />
        )}
      </div>
    </div>
  );
}
