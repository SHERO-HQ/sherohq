"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
import {
  cancelNewsletterCampaign,
  deleteNewsletterCampaign,
  fetchNewsletterCampaigns,
  fetchNewsletterSubscribers,
  processScheduledNewsletterCampaigns,
  sendNewsletterCampaign,
  updateNewsletterSubscriberContact,
  updateNewsletterSubscriberStatus,
  type NewsletterCampaign,
  type NewsletterSubscriber,
} from "@/services/api";
import { getErrorMessage } from "@/utils/error";

export type SubscriberFilter = "all" | "active" | "unsubscribed";
export type AudienceStatusFilter = "active" | "unsubscribed" | "all";
export type CampaignChannel = "email" | "sms" | "whatsapp";

export function useAdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubscriberFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
  });

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("email");
  const [whatsAppTemplateName, setWhatsAppTemplateName] = useState("");
  const [whatsAppTemplateLanguage, setWhatsAppTemplateLanguage] = useState("en");
  const [whatsAppTemplateParamsText, setWhatsAppTemplateParamsText] = useState("");
  const [testTarget, setTestTarget] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [audienceStatus, setAudienceStatus] = useState<AudienceStatusFilter>("active");
  const [audienceSource, setAudienceSource] = useState("");
  const [audienceSubscribedAfter, setAudienceSubscribedAfter] = useState("");
  const [audienceSubscribedBefore, setAudienceSubscribedBefore] = useState("");
  const [batchSize, setBatchSize] = useState("100");
  const [sendDelayMs, setSendDelayMs] = useState("0");
  const [recipientLimit, setRecipientLimit] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingSubscriberId, setEditingSubscriberId] = useState<string | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [isCampaignHistoryLoading, setIsCampaignHistoryLoading] = useState(true);
  const [isProcessingScheduled, setIsProcessingScheduled] = useState(false);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState<string | null>(null);
  const [isCancellingCampaign, setIsCancellingCampaign] = useState<string | null>(null);

  const { addNotification } = useNotifications();
  const dialog = useDialog();

  const loadSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchNewsletterSubscribers({
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      });
      setSubscribers(data.subscribers);
      setCounts(data.counts);
    } catch (error) {
      console.error("Failed to load newsletter subscribers:", error);
      addNotification("Error", "Failed to load newsletter subscribers", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, searchQuery, statusFilter]);

  useEffect(() => {
    void loadSubscribers();
  }, [loadSubscribers]);

  const loadCampaigns = useCallback(async () => {
    try {
      setIsCampaignHistoryLoading(true);
      const result = await fetchNewsletterCampaigns(25);
      setCampaigns(result.campaigns);
    } catch (error) {
      console.error("Failed to load campaign history:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to load campaign history"),
        "error",
      );
    } finally {
      setIsCampaignHistoryLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const sortedSubscribers = useMemo(() => {
    return [...subscribers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [subscribers]);

  const scheduledCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "scheduled"),
    [campaigns],
  );

  const deliveryStats = useMemo(() => {
    return campaigns.reduce(
      (stats, campaign) => {
        stats.sent += campaign.sentCount || 0;
        stats.failed += campaign.failedCount || 0;
        stats.targets += campaign.totalTargets || 0;
        return stats;
      },
      { sent: 0, failed: 0, targets: 0 },
    );
  }, [campaigns]);

  const parsedRecipientLimit = recipientLimit.trim()
    ? Number.parseInt(recipientLimit, 10)
    : undefined;
  const baseAudience =
    audienceStatus === "active"
      ? counts.active
      : audienceStatus === "unsubscribed"
        ? counts.unsubscribed
        : counts.total;
  const estimatedAudience =
    typeof parsedRecipientLimit === "number" &&
    Number.isInteger(parsedRecipientLimit) &&
    parsedRecipientLimit > 0
      ? Math.min(baseAudience, parsedRecipientLimit)
      : baseAudience;
  const activeRate =
    counts.total > 0 ? Math.round((counts.active / counts.total) * 100) : 0;
  const deliveryRate =
    deliveryStats.targets > 0
      ? Math.round((deliveryStats.sent / deliveryStats.targets) * 100)
      : 0;

  const channelLabel =
    channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Email";
  const testTargetLabel =
    channel === "whatsapp" || channel === "sms"
      ? "Test recipient phone"
      : "Test recipient email";
  const testTargetPlaceholder =
    channel === "whatsapp" || channel === "sms"
      ? "+233XXXXXXXXX"
      : "name@example.com";
  const contentPlaceholder =
    channel === "whatsapp" || channel === "sms"
      ? "Write the plain text message"
      : "Write the email HTML or plain text";

  const refreshWorkspace = async () => {
    await Promise.all([loadSubscribers(), loadCampaigns()]);
  };

  const handleStatusChange = async (
    subscriber: NewsletterSubscriber,
    nextStatus: "active" | "unsubscribed",
  ) => {
    try {
      await updateNewsletterSubscriberStatus(subscriber.id, nextStatus);
      setSubscribers((prev) =>
        prev.map((item) =>
          item.id === subscriber.id
            ? {
                ...item,
                status: nextStatus,
                unsubscribedAt:
                  nextStatus === "unsubscribed" ? new Date().toISOString() : null,
              }
            : item,
        ),
      );
      setCounts((prev) => {
        const activeDelta = nextStatus === "active" ? 1 : -1;
        return {
          ...prev,
          active: Math.max(0, prev.active + activeDelta),
          unsubscribed: Math.max(0, prev.unsubscribed - activeDelta),
        };
      });
      addNotification("Success", "Subscriber status updated", "success");
    } catch (error) {
      console.error("Failed to update subscriber status:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to update subscriber status"),
        "error",
      );
    }
  };

  const handleStartEditSubscriber = (subscriber: NewsletterSubscriber) => {
    setEditingSubscriberId(subscriber.id);
    setEditPhoneValue(subscriber.phone ?? "");
  };

  const handleCancelEditSubscriber = () => {
    setEditingSubscriberId(null);
    setEditPhoneValue("");
  };

  const handleSaveSubscriberContact = async (subscriberId: string) => {
    const trimmed = editPhoneValue.trim();
    if (trimmed && !/^\+?[1-9]\d{7,14}$/.test(trimmed.replace(/[\s()-]/g, ""))) {
      addNotification("Warning", "Use a valid phone format", "warning");
      return;
    }

    try {
      setIsSavingContact(true);
      const response = await updateNewsletterSubscriberContact(subscriberId, {
        phone: trimmed || null,
      });

      setSubscribers((prev) =>
        prev.map((item) =>
          item.id === subscriberId ? { ...item, ...response.subscriber } : item,
        ),
      );
      setEditingSubscriberId(null);
      setEditPhoneValue("");
      addNotification("Success", "Subscriber contact updated", "success");
    } catch (error) {
      console.error("Failed to update subscriber contact:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to update subscriber contact"),
        "error",
      );
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSendCampaign = async (mode: "test" | "live") => {
    if (!subject.trim() || !content.trim()) {
      addNotification("Warning", "Subject and content are required", "warning");
      return;
    }

    if (mode === "test" && !testTarget.trim()) {
      addNotification("Warning", `Provide a ${testTargetLabel}`, "warning");
      return;
    }

    try {
      const parsedBatchSize = Number.parseInt(batchSize, 10);
      const parsedDelay = Number.parseInt(sendDelayMs, 10);
      const parsedLimit = recipientLimit.trim()
        ? Number.parseInt(recipientLimit, 10)
        : undefined;

      if (!Number.isInteger(parsedBatchSize) || parsedBatchSize < 1) {
        addNotification("Warning", "Batch size must be 1 or more", "warning");
        return;
      }

      if (!Number.isInteger(parsedDelay) || parsedDelay < 0) {
        addNotification(
          "Warning",
          "Delay must be 0 or more milliseconds",
          "warning",
        );
        return;
      }

      if (
        typeof parsedLimit === "number" &&
        (!Number.isInteger(parsedLimit) || parsedLimit < 1)
      ) {
        addNotification("Warning", "Recipient limit must be 1 or more", "warning");
        return;
      }

      setIsSending(true);

      const normalizedTestTarget = testTarget.trim();
      const parsedWhatsAppParams = whatsAppTemplateParamsText
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      if (channel === "whatsapp" && !whatsAppTemplateName.trim()) {
        addNotification(
          "Warning",
          "WhatsApp campaigns require an approved template name",
          "warning",
        );
        return;
      }

      const result = await sendNewsletterCampaign({
        channel,
        subject: subject.trim(),
        content,
        testEmail:
          mode === "test" && channel === "email"
            ? normalizedTestTarget.toLowerCase()
            : undefined,
        testPhone:
          mode === "test" && channel !== "email"
            ? normalizedTestTarget
            : undefined,
        whatsappTemplateName:
          channel === "whatsapp" && whatsAppTemplateName.trim()
            ? whatsAppTemplateName.trim()
            : undefined,
        whatsappTemplateLanguage:
          channel === "whatsapp" && whatsAppTemplateLanguage.trim()
            ? whatsAppTemplateLanguage.trim()
            : undefined,
        whatsappTemplateParams:
          channel === "whatsapp" && parsedWhatsAppParams.length > 0
            ? parsedWhatsAppParams
            : undefined,
        batchSize: parsedBatchSize,
        sendDelayMs: parsedDelay,
        limit: parsedLimit,
        scheduleAt:
          mode === "live" && scheduleAt
            ? new Date(scheduleAt).toISOString()
            : undefined,
        audienceStatus,
        audienceSource: audienceSource.trim() || undefined,
        audienceSubscribedAfter: audienceSubscribedAfter
          ? new Date(audienceSubscribedAfter).toISOString()
          : undefined,
        audienceSubscribedBefore: audienceSubscribedBefore
          ? new Date(audienceSubscribedBefore).toISOString()
          : undefined,
      });

      addNotification(
        "Success",
        result.message ||
          "Campaign started in the background. Check history for progress.",
        "success",
      );

      if (mode === "live") {
        setSubject("");
        setContent("");
      }

      void refreshWorkspace();
    } catch (error) {
      console.error("Newsletter campaign failed:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to send campaign"),
        "error",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleProcessScheduled = async () => {
    try {
      setIsProcessingScheduled(true);
      const result = await processScheduledNewsletterCampaigns();
      addNotification(
        "Success",
        result.message || `Processed ${result.processed} scheduled campaign(s).`,
        "success",
      );
      await refreshWorkspace();
    } catch (error) {
      console.error("Failed to process scheduled campaigns:", error);
      addNotification("Error", "Failed to process scheduled campaigns", "error");
    } finally {
      setIsProcessingScheduled(false);
    }
  };

  const handleCancelCampaign = async (id: string) => {
    const shouldCancel = await dialog.confirm({
      title: "Cancel scheduled campaign?",
      message: "Are you sure you want to cancel this scheduled campaign?",
      confirmText: "Cancel campaign",
      cancelText: "Keep scheduled",
      type: "error",
    });

    if (!shouldCancel) return;

    try {
      setIsCancellingCampaign(id);
      await cancelNewsletterCampaign(id);
      addNotification("Success", "Campaign cancelled", "success");
      void loadCampaigns();
    } catch (error) {
      console.error("Failed to cancel campaign:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to cancel campaign"),
        "error",
      );
    } finally {
      setIsCancellingCampaign(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    const shouldDelete = await dialog.confirm({
      title: "Delete campaign?",
      message: "Are you sure you want to delete this campaign? This cannot be undone.",
      confirmText: "Delete campaign",
      cancelText: "Keep campaign",
      type: "error",
    });

    if (!shouldDelete) return;

    try {
      setIsDeletingCampaign(id);
      await deleteNewsletterCampaign(id);
      addNotification("Success", "Campaign deleted", "success");
      void loadCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to delete campaign"),
        "error",
      );
    } finally {
      setIsDeletingCampaign(null);
    }
  };

  return {
    subscribers,
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
  };
}
