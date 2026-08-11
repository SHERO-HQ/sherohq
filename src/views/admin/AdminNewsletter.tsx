"use client";

import Link from "next/link";
import {
  ArrowLeft,
  History,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Send,
  Users,
  LayoutTemplate,
  Mail,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsletterStats } from "@/components/admin/newsletter/NewsletterStats";
import { NewsletterHistoryTab } from "@/components/admin/newsletter/NewsletterHistoryTab";
import { NewsletterSubscribersTab } from "@/components/admin/newsletter/NewsletterSubscribersTab";
import { WhatsAppAudienceList } from "@/components/admin/newsletter/WhatsAppAudienceList";
import { NewsletterTemplatesTab } from "@/components/admin/newsletter/NewsletterTemplatesTab";
import { NewsletterComposerTab } from "@/components/admin/newsletter/NewsletterComposerTab";
import { useAdminNewsletter } from "@/components/admin/newsletter/useAdminNewsletter";

export default function AdminNewsletter() {
  const {
    isLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    counts,
    subject,
    setSubject,
    content,
    setContent,
    channel,
    setChannel,
    whatsAppTemplateName,
    setWhatsAppTemplateName,
    whatsAppTemplateLanguage,
    setWhatsAppTemplateLanguage,
    whatsAppTemplateParamsText,
    setWhatsAppTemplateParamsText,
    testTarget,
    setTestTarget,
    scheduleAt,
    setScheduleAt,
    audienceStatus,
    setAudienceStatus,
    audienceSource,
    setAudienceSource,
    audienceSubscribedAfter,
    setAudienceSubscribedAfter,
    audienceSubscribedBefore,
    setAudienceSubscribedBefore,
    batchSize,
    setBatchSize,
    sendDelayMs,
    setSendDelayMs,
    recipientLimit,
    setRecipientLimit,
    isSending,
    editingSubscriberId,
    editPhoneValue,
    setEditPhoneValue,
    isSavingContact,
    campaigns,
    isCampaignHistoryLoading,
    isProcessingScheduled,
    isDeletingCampaign,
    isCancellingCampaign,
    sortedSubscribers,
    scheduledCampaigns,
    deliveryStats,
    estimatedAudience,
    activeRate,
    deliveryRate,
    channelLabel,
    testTargetLabel,
    testTargetPlaceholder,
    contentPlaceholder,
    refreshWorkspace,
    handleStatusChange,
    handleStartEditSubscriber,
    handleCancelEditSubscriber,
    handleSaveSubscriberContact,
    handleSendCampaign,
    handleProcessScheduled,
    handleCancelCampaign,
    handleDeleteCampaign,
  } = useAdminNewsletter();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-brand-secondary-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <AdminPageHeader
          icon={Mail}
          title={
            <>
              Newsletter & Broadcasts
              {scheduledCampaigns.length > 0 ? (
                <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-300 ml-3">
                  {scheduledCampaigns.length} scheduled
                </Badge>
              ) : null}
            </>
          }
          description="Manage newsletter audiences and email broadcasts"
        >
          <Button
            onClick={() => void refreshWorkspace()}
            variant="outline"
            className="w-full border-border text-muted-foreground hover:text-foreground sm:w-auto"
            disabled={isLoading || isCampaignHistoryLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </AdminPageHeader>
      </div>

      <NewsletterStats
        counts={counts}
        activeRate={activeRate}
        deliveryRate={deliveryRate}
        deliveryStats={deliveryStats}
        estimatedAudience={estimatedAudience as number}
        audienceStatus={audienceStatus}
      />

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded border border-border bg-card p-1 text-muted-foreground sm:grid-cols-5 lg:inline-grid lg:w-auto">
          <TabsTrigger
            value="templates"
            className="gap-2 rounded data-[state=active]:bg-brand-secondary-500/15 data-[state=active]:text-brand-secondary-200"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="compose"
            className="gap-2 rounded data-[state=active]:bg-brand-secondary-500/15 data-[state=active]:text-brand-secondary-200"
          >
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="gap-2 rounded data-[state=active]:bg-brand-secondary-500/15 data-[state=active]:text-brand-secondary-200"
          >
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="gap-2 rounded data-[state=active]:bg-brand-secondary-500/15 data-[state=active]:text-brand-secondary-200"
          >
            <Users className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger
            value="whatsapp"
            className="gap-2 rounded data-[state=active]:bg-brand-secondary-500/15 data-[state=active]:text-brand-secondary-200"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-5">
          <NewsletterComposerTab
            channel={channel}
            setChannel={setChannel}
            subject={subject}
            setSubject={setSubject}
            scheduleAt={scheduleAt}
            setScheduleAt={setScheduleAt}
            whatsAppTemplateName={whatsAppTemplateName}
            setWhatsAppTemplateName={setWhatsAppTemplateName}
            whatsAppTemplateLanguage={whatsAppTemplateLanguage}
            setWhatsAppTemplateLanguage={setWhatsAppTemplateLanguage}
            whatsAppTemplateParamsText={whatsAppTemplateParamsText}
            setWhatsAppTemplateParamsText={setWhatsAppTemplateParamsText}
            content={content}
            setContent={setContent}
            contentPlaceholder={contentPlaceholder}
            testTarget={testTarget}
            setTestTarget={setTestTarget}
            testTargetLabel={testTargetLabel}
            testTargetPlaceholder={testTargetPlaceholder}
            channelLabel={channelLabel}
            audienceStatus={audienceStatus}
            setAudienceStatus={setAudienceStatus}
            audienceSource={audienceSource}
            setAudienceSource={setAudienceSource}
            audienceSubscribedAfter={audienceSubscribedAfter}
            setAudienceSubscribedAfter={setAudienceSubscribedAfter}
            audienceSubscribedBefore={audienceSubscribedBefore}
            setAudienceSubscribedBefore={setAudienceSubscribedBefore}
            batchSize={batchSize}
            setBatchSize={setBatchSize}
            sendDelayMs={sendDelayMs}
            setSendDelayMs={setSendDelayMs}
            recipientLimit={recipientLimit}
            setRecipientLimit={setRecipientLimit}
            estimatedAudience={estimatedAudience}
            isSending={isSending}
            handleSendCampaign={handleSendCampaign}
          />
        </TabsContent>

        <NewsletterHistoryTab
          campaigns={campaigns}
          isCampaignHistoryLoading={isCampaignHistoryLoading}
          isProcessingScheduled={isProcessingScheduled}
          isCancellingCampaign={isCancellingCampaign}
          isDeletingCampaign={isDeletingCampaign}
          onProcessScheduled={handleProcessScheduled}
          onCancelCampaign={handleCancelCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />

        <NewsletterSubscribersTab
          subscribers={sortedSubscribers}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          editingSubscriberId={editingSubscriberId}
          editPhoneValue={editPhoneValue}
          setEditPhoneValue={setEditPhoneValue}
          isSavingContact={isSavingContact}
          onSaveSubscriberContact={handleSaveSubscriberContact}
          onCancelEditSubscriber={handleCancelEditSubscriber}
          onStartEditSubscriber={handleStartEditSubscriber}
          onStatusChange={handleStatusChange}
        />

        <WhatsAppAudienceList />

        <TabsContent value="templates" className="mt-5">
          <NewsletterTemplatesTab
            onSelectTemplate={(selectedChannel, template) => {
              setChannel(selectedChannel);
              if (selectedChannel === "email") {
                setSubject(template.subject || "");
                setContent(template.html || "");
              } else if (selectedChannel === "sms") {
                setSubject(template.name || "");
                setContent(template.content || "");
              } else if (selectedChannel === "whatsapp") {
                setWhatsAppTemplateName(template.name || "");
                setSubject(template.name || "");
                setWhatsAppTemplateLanguage(template.language || "en");
                setContent(template.description || "");
                if (template.expectedParams && template.expectedParams.length > 0) {
                  setWhatsAppTemplateParamsText(
                    template.expectedParams
                      .map((p: string) => `[${p}]`)
                      .join(", "),
                  );
                } else {
                  setWhatsAppTemplateParamsText("");
                }
              }
              const composeTab = document.querySelector<HTMLButtonElement>(
                '[role="tab"][value="compose"]',
              );
              if (composeTab) composeTab.click();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
