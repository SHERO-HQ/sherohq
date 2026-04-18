"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  History,
  Mail,
  MessageCircle,
  Play,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  fetchNewsletterSubscribers,
  fetchNewsletterCampaigns,
  processScheduledNewsletterCampaigns,
  sendNewsletterCampaign,
  updateNewsletterSubscriberContact,
  updateNewsletterSubscriberStatus,
  type NewsletterCampaign,
  type NewsletterSubscriber,
  deleteNewsletterCampaign,
  cancelNewsletterCampaign,
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SubscriberFilter = "all" | "active" | "unsubscribed";
type AudienceStatusFilter = "active" | "unsubscribed" | "all";
type CampaignChannel = "email" | "sms" | "whatsapp";

export default function AdminNewsletter() {
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
  const [whatsAppTemplateLanguage, setWhatsAppTemplateLanguage] =
    useState("en");
  const [whatsAppTemplateParamsText, setWhatsAppTemplateParamsText] =
    useState("");
  const [testTarget, setTestTarget] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [audienceStatus, setAudienceStatus] =
    useState<AudienceStatusFilter>("active");
  const [audienceSource, setAudienceSource] = useState("");
  const [audienceSubscribedAfter, setAudienceSubscribedAfter] = useState("");
  const [audienceSubscribedBefore, setAudienceSubscribedBefore] = useState("");
  const [batchSize, setBatchSize] = useState("100");
  const [sendDelayMs, setSendDelayMs] = useState("0");
  const [recipientLimit, setRecipientLimit] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingSubscriberId, setEditingSubscriberId] = useState<string | null>(
    null,
  );
  const [editPhoneValue, setEditPhoneValue] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [isCampaignHistoryLoading, setIsCampaignHistoryLoading] =
    useState(true);
  const [isProcessingScheduled, setIsProcessingScheduled] = useState(false);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState<string | null>(
    null,
  );
  const [isCancellingCampaign, setIsCancellingCampaign] = useState<
    string | null
  >(null);

  const { addNotification } = useNotifications();

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
      addNotification(
        "Error",
        "Failed to load newsletter subscribers",
        "error",
      );
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
      addNotification("Error", "Failed to load campaign history", "error");
    } finally {
      setIsCampaignHistoryLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const sortedSubscribers = useMemo(() => {
    return [...subscribers].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [subscribers]);

  const channelLabel =
    channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Email";
  const testTargetLabel =
    channel === "whatsapp" || channel === "sms"
      ? "Test Recipient Phone"
      : "Test Recipient Email";
  const testTargetPlaceholder =
    channel === "whatsapp" || channel === "sms"
      ? "+233XXXXXXXXX"
      : "name@example.com";
  const contentPlaceholder =
    channel === "whatsapp" || channel === "sms"
      ? "Write your plain text message (standard SMS/WhatsApp)..."
      : "Write HTML content for your email campaign...";

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
                  nextStatus === "unsubscribed"
                    ? new Date().toISOString()
                    : null,
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
      addNotification("Error", "Failed to update subscriber status", "error");
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
    if (
      trimmed &&
      !/^\+?[1-9]\d{7,14}$/.test(trimmed.replace(/[\s()-]/g, ""))
    ) {
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
      addNotification("Error", "Failed to update subscriber contact", "error");
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
      addNotification(
        "Warning",
        `Provide a test ${channel === "whatsapp" ? "phone" : "email"} before sending test`,
        "warning",
      );
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
        addNotification(
          "Warning",
          "Recipient limit must be 1 or more",
          "warning",
        );
        return;
      }

      setIsSending(true);

      const normalizedTestTarget = testTarget.trim();
      const parsedWhatsAppParams = whatsAppTemplateParamsText
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      if (
        mode === "live" &&
        channel === "whatsapp" &&
        !whatsAppTemplateName.trim()
      ) {
        addNotification(
          "Warning",
          "Live WhatsApp campaigns require an approved template name",
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
          mode === "test" && channel === "whatsapp"
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

      void loadSubscribers();
      void loadCampaigns();
    } catch (error) {
      console.error("Newsletter campaign failed:", error);
      addNotification("Error", "Failed to send campaign", "error");
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
        result.message ||
          `Processed ${result.processed} scheduled campaign(s).`,
        "success",
      );
      await Promise.all([loadCampaigns(), loadSubscribers()]);
    } catch (error) {
      console.error("Failed to process scheduled campaigns:", error);
      addNotification(
        "Error",
        "Failed to process scheduled campaigns",
        "error",
      );
    } finally {
      setIsProcessingScheduled(false);
    }
  };

  const handleCancelCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled campaign?"))
      return;

    try {
      setIsCancellingCampaign(id);
      await cancelNewsletterCampaign(id);
      addNotification("Success", "Campaign cancelled", "success");
      void loadCampaigns();
    } catch (error) {
      console.error("Failed to cancel campaign:", error);
      addNotification("Error", "Failed to cancel campaign", "error");
    } finally {
      setIsCancellingCampaign(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this campaign? This cannot be undone.",
      )
    )
      return;

    try {
      setIsDeletingCampaign(id);
      await deleteNewsletterCampaign(id);
      addNotification("Success", "Campaign deleted", "success");
      void loadCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      addNotification("Error", "Failed to delete campaign", "error");
    } finally {
      setIsDeletingCampaign(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-secondary-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Newsletter</h1>
              <p className="text-slate-400 mt-1 text-sm">
                Manage subscribers and run outreach campaigns from admin.
              </p>
            </div>
            <Button
              onClick={() => void loadSubscribers()}
              variant="outline"
              className="border-white/10 text-slate-300 hover:text-white"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{counts.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-brand-secondary-400">
                {counts.active}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">
                Unsubscribed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-400">
                {counts.unsubscribed}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="mb-4 w-full justify-start bg-slate-900/50 text-slate-300">
            <TabsTrigger
              value="compose"
              className="data-[state=active]:bg-brand-secondary-500/20 data-[state=active]:text-brand-secondary-300"
            >
              <Send className="mr-2 h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-brand-secondary-500/20 data-[state=active]:text-brand-secondary-300"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="subscribers"
              className="data-[state=active]:bg-brand-secondary-500/20 data-[state=active]:text-brand-secondary-300"
            >
              <Users className="mr-2 h-4 w-4" />
              Subscribers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 bg-slate-900/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {channel === "whatsapp" ? (
                      <MessageCircle className="w-5 h-5 text-brand-secondary-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-brand-secondary-400" />
                    )}
                    Campaign Composer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="campaign-channel"
                        className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                      >
                        Channel
                      </label>
                      <select
                        id="campaign-channel"
                        value={channel}
                        onChange={(e) => {
                          setChannel(e.target.value as CampaignChannel);
                          setTestTarget("");
                          if (e.target.value !== "whatsapp") {
                            setWhatsAppTemplateName("");
                            setWhatsAppTemplateLanguage("en");
                            setWhatsAppTemplateParamsText("");
                          }
                        }}
                        className="w-full h-10 rounded border border-white/10 bg-slate-900/50 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand-secondary-500/30"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="campaign-subject"
                        className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                      >
                        {channel === "whatsapp" ? "Campaign Name" : "Subject"}
                      </label>
                      <Input
                        id="campaign-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={
                          channel === "whatsapp"
                            ? "Internal campaign title"
                            : "Email subject"
                        }
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="campaign-content"
                      className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                    >
                      Message
                    </label>
                    <textarea
                      id="campaign-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={contentPlaceholder}
                      rows={12}
                      className="w-full rounded border border-white/10 bg-slate-900/50 p-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-secondary-500/30"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-slate-900/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">
                      Send Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="newsletter-test-target"
                        className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                      >
                        {testTargetLabel}
                        {channel === "whatsapp" ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded border border-white/10 bg-slate-900/20 p-3">
                            <div className="space-y-1 md:col-span-1">
                              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Template Name
                              </label>
                              <Input
                                value={whatsAppTemplateName}
                                onChange={(e) =>
                                  setWhatsAppTemplateName(e.target.value)
                                }
                                placeholder="promo_launch_v1"
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-1">
                              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Template Language
                              </label>
                              <Input
                                value={whatsAppTemplateLanguage}
                                onChange={(e) =>
                                  setWhatsAppTemplateLanguage(e.target.value)
                                }
                                placeholder="en"
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-1">
                              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Template Params (comma-separated)
                              </label>
                              <Input
                                value={whatsAppTemplateParamsText}
                                onChange={(e) =>
                                  setWhatsAppTemplateParamsText(e.target.value)
                                }
                                placeholder="Kwame, 15%"
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                              />
                            </div>
                          </div>
                        ) : null}
                      </label>
                      <Input
                        id="newsletter-test-target"
                        value={testTarget}
                        onChange={(e) => setTestTarget(e.target.value)}
                        placeholder={testTargetPlaceholder}
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                      />
                    </div>
                    <Button
                      disabled={isSending}
                      variant="outline"
                      className="w-full border-white/10 text-slate-300 hover:text-white"
                      onClick={() => void handleSendCampaign("test")}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send {channelLabel} Test
                    </Button>
                    <p className="text-xs text-slate-400">
                      Test target is used only for test mode and does not affect
                      live audience sends.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">
                      Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="newsletter-audience-status"
                        className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                      >
                        Audience Status
                      </label>
                      <select
                        id="newsletter-audience-status"
                        value={audienceStatus}
                        onChange={(e) =>
                          setAudienceStatus(
                            e.target.value as AudienceStatusFilter,
                          )
                        }
                        className="w-full h-10 rounded border border-white/10 bg-slate-900/50 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand-secondary-500/30"
                      >
                        <option value="active">Active</option>
                        <option value="all">All</option>
                        <option value="unsubscribed">Unsubscribed</option>
                      </select>
                    </div>
                    <Input
                      value={audienceSource}
                      onChange={(e) => setAudienceSource(e.target.value)}
                      placeholder="Source filter (e.g. footer)"
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                    />
                    <Input
                      type="datetime-local"
                      value={audienceSubscribedAfter}
                      onChange={(e) =>
                        setAudienceSubscribedAfter(e.target.value)
                      }
                      className="bg-slate-900/50 border-white/10 text-white"
                    />
                    <Input
                      type="datetime-local"
                      value={audienceSubscribedBefore}
                      onChange={(e) =>
                        setAudienceSubscribedBefore(e.target.value)
                      }
                      className="bg-slate-900/50 border-white/10 text-white"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">
                      Delivery Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={batchSize}
                      onChange={(e) => setBatchSize(e.target.value)}
                      placeholder="Batch size (e.g. 100)"
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={10000}
                      value={sendDelayMs}
                      onChange={(e) => setSendDelayMs(e.target.value)}
                      placeholder="Delay between batches (ms)"
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={recipientLimit}
                      onChange={(e) => setRecipientLimit(e.target.value)}
                      placeholder="Optional recipient limit"
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                    />
                    <Input
                      id="newsletter-schedule"
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                      className="bg-slate-900/50 border-white/10 text-white"
                    />
                    <Button
                      disabled={isSending}
                      className="w-full bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
                      onClick={() => void handleSendCampaign("live")}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {scheduleAt
                        ? `Schedule ${channelLabel}`
                        : `Send ${channelLabel} Campaign`}
                    </Button>
                    <p className="text-xs text-slate-400">
                      {channel === "whatsapp"
                        ? "Live WhatsApp sends use approved templates and subscriber phone numbers."
                        : "Bulk email sends run in batches to reduce provider throttling."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-slate-900/40 border-white/10">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-white">Campaign History</CardTitle>
                  <Button
                    onClick={() => void handleProcessScheduled()}
                    disabled={isProcessingScheduled}
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Process Scheduled
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isCampaignHistoryLoading ? (
                  <p className="text-slate-400 text-sm">
                    Loading campaign history...
                  </p>
                ) : campaigns.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    No campaigns yet. Sent and scheduled campaigns will appear
                    here.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-slate-400">
                          <th className="py-3 pr-4">Subject</th>
                          <th className="py-3 pr-4">Channel</th>
                          <th className="py-3 pr-4">Status</th>
                          <th className="py-3 pr-4">Audience</th>
                          <th className="py-3 pr-4">Results</th>
                          <th className="py-3 pr-4">Scheduled</th>
                          <th className="py-3 pr-4">Sent</th>
                          <th className="py-3 pr-0">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign) => (
                          <tr
                            key={campaign.id}
                            className="border-b border-white/5"
                          >
                            <td className="py-3 pr-4 text-white">
                              <div
                                className="max-w-80 truncate"
                                title={campaign.subject}
                              >
                                {campaign.subject}
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className="bg-slate-800 text-slate-200 border-white/10 uppercase">
                                {campaign.channel}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge
                                className={
                                  campaign.status === "sent"
                                    ? "bg-brand-secondary-500/10 text-brand-secondary-400 border-brand-secondary-500/20"
                                    : campaign.status === "scheduled"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : campaign.status === "failed"
                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {campaign.audienceStatus}
                              {campaign.audienceSource
                                ? ` / ${campaign.audienceSource}`
                                : ""}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {campaign.sentCount}/{campaign.totalTargets} sent
                              {campaign.failedCount > 0
                                ? `, ${campaign.failedCount} failed`
                                : ""}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {campaign.scheduledAt
                                ? format(
                                    new Date(campaign.scheduledAt),
                                    "PPP p",
                                  )
                                : "-"}
                            </td>
                            <td className="py-3 pr-0 text-slate-300">
                              {campaign.sentAt
                                ? format(new Date(campaign.sentAt), "PPP p")
                                : "-"}
                            </td>
                            <td className="py-3 pr-0 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {campaign.status === "scheduled" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                                    onClick={() =>
                                      void handleCancelCampaign(campaign.id)
                                    }
                                    disabled={
                                      isCancellingCampaign === campaign.id
                                    }
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                                  onClick={() =>
                                    void handleDeleteCampaign(campaign.id)
                                  }
                                  disabled={isDeletingCampaign === campaign.id}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card className="bg-slate-900/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Subscribers</CardTitle>
                <div className="flex flex-col md:flex-row gap-3 mt-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email, name, or phone"
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as SubscriberFilter)
                    }
                    className="rounded border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-secondary-500/30"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-slate-400 text-sm">
                    Loading subscribers...
                  </p>
                ) : sortedSubscribers.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    No subscribers found for this filter.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-slate-400">
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3 pr-4">Phone</th>
                          <th className="py-3 pr-4">Source</th>
                          <th className="py-3 pr-4">Subscribed</th>
                          <th className="py-3 pr-4">Last Campaign</th>
                          <th className="py-3 pr-4">Status</th>
                          <th className="py-3 pr-0">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSubscribers.map((subscriber) => (
                          <tr
                            key={subscriber.id}
                            className="border-b border-white/5"
                          >
                            <td className="py-3 pr-4 text-white">
                              {subscriber.email}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {editingSubscriberId === subscriber.id ? (
                                <Input
                                  value={editPhoneValue}
                                  onChange={(e) =>
                                    setEditPhoneValue(e.target.value)
                                  }
                                  placeholder="+233XXXXXXXXX"
                                  className="h-8 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                                />
                              ) : (
                                subscriber.phone || "-"
                              )}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {subscriber.source || "-"}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {format(new Date(subscriber.subscribedAt), "PPP")}
                            </td>
                            <td className="py-3 pr-4 text-slate-300">
                              {subscriber.lastCampaignAt
                                ? format(
                                    new Date(subscriber.lastCampaignAt),
                                    "PPP",
                                  )
                                : "-"}
                            </td>
                            <td className="py-3 pr-4">
                              {subscriber.status === "active" ? (
                                <Badge className="bg-brand-secondary-500/10 text-brand-secondary-400 border-brand-secondary-500/20">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                  Unsubscribed
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 pr-0">
                              <div className="flex flex-wrap gap-2">
                                {editingSubscriberId === subscriber.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-8 bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white"
                                      disabled={isSavingContact}
                                      onClick={() =>
                                        void handleSaveSubscriberContact(
                                          subscriber.id,
                                        )
                                      }
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 border-white/10 text-slate-300 hover:text-white"
                                      disabled={isSavingContact}
                                      onClick={handleCancelEditSubscriber}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 border-white/10 text-slate-300 hover:text-white"
                                      onClick={() =>
                                        handleStartEditSubscriber(subscriber)
                                      }
                                    >
                                      Edit Phone
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 border-white/10 text-slate-300 hover:text-white"
                                      onClick={() =>
                                        void handleStatusChange(
                                          subscriber,
                                          subscriber.status === "active"
                                            ? "unsubscribed"
                                            : "active",
                                        )
                                      }
                                    >
                                      {subscriber.status === "active"
                                        ? "Unsubscribe"
                                        : "Reactivate"}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
