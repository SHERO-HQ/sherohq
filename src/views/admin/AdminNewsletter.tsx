"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode} from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Users,
  XCircle} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils";
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
  type NewsletterSubscriber} from "@/services/api";
import { getErrorMessage } from "@/utils/error";

import { NewsletterStats } from "@/components/admin/newsletter/NewsletterStats";
import { NewsletterHistoryTab } from "@/components/admin/newsletter/NewsletterHistoryTab";
import { NewsletterSubscribersTab } from "@/components/admin/newsletter/NewsletterSubscribersTab";


type SubscriberFilter = "all" | "active" | "unsubscribed";
type AudienceStatusFilter = "active" | "unsubscribed" | "all";
type CampaignChannel = "email" | "sms" | "whatsapp";

const inputClass =
  "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-brand-secondary-500/70 focus-visible:ring-brand-secondary-500/20";

const selectClass =
  "h-9 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-brand-secondary-500/70 focus:ring-2 focus:ring-brand-secondary-500/20";

const panelClass =
  "rounded border border-border bg-card shadow-sm shadow-black/10";

const channels: Array<{
  value: CampaignChannel;
  label: string;
  icon: typeof Mail;
  disabled?: boolean;
}> = [
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS", icon: MessageCircle },
];

function Field({
  label,
  htmlFor,
  children,
  className}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate"}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone?: "slate" | "green" | "amber" | "blue";
}) {
  const toneClass = {
    slate: "text-muted-foreground bg-slate-500/10 border-slate-500/15",
    green:
      "text-brand-secondary-300 bg-brand-secondary-500/10 border-brand-secondary-500/20",
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    blue: "text-sky-300 bg-sky-500/10 border-sky-500/20"}[tone];

  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("rounded border p-2", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}

function safeDate(value?: string | null, pattern = "PPP") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, pattern);
}

function campaignStatusClass(status: NewsletterCampaign["status"]) {
  if (status === "sent") {
    return "border-brand-secondary-500/20 bg-brand-secondary-500/10 text-brand-secondary-300";
  }
  if (status === "scheduled") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-300";
  }
  if (status === "failed") {
    return "border-rose-500/20 bg-rose-500/10 text-rose-300";
  }
  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function statusIcon(status: NewsletterCampaign["status"]) {
  if (status === "sent") return CheckCircle2;
  if (status === "failed") return XCircle;
  if (status === "scheduled") return CalendarClock;
  return Clock3;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubscriberFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0});

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
  const dialog = useDialog();

  const loadSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchNewsletterSubscribers({
        status: statusFilter,
        search: searchQuery.trim() || undefined});
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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
                  nextStatus === "unsubscribed"
                    ? new Date().toISOString()
                    : null}
            : item,
        ),
      );
      setCounts((prev) => {
        const activeDelta = nextStatus === "active" ? 1 : -1;
        return {
          ...prev,
          active: Math.max(0, prev.active + activeDelta),
          unsubscribed: Math.max(0, prev.unsubscribed - activeDelta)};
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
        phone: trimmed || null});

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
          : undefined});

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
        result.message ||
          `Processed ${result.processed} scheduled campaign(s).`,
        "success",
      );
      await refreshWorkspace();
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
    const shouldCancel = await dialog.confirm({
      title: "Cancel scheduled campaign?",
      message: "Are you sure you want to cancel this scheduled campaign?",
      confirmText: "Cancel campaign",
      cancelText: "Keep scheduled",
      type: "warning"});

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
      message:
        "Are you sure you want to delete this campaign? This cannot be undone.",
      confirmText: "Delete campaign",
      cancelText: "Keep campaign",
      type: "warning"});

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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Newsletter
              </h1>
              {scheduledCampaigns.length > 0 ? (
                <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-300">
                  {scheduledCampaigns.length} scheduled
                </Badge>
              ) : null}
            </div>
          </div>

          <Button
            onClick={() => void refreshWorkspace()}
            variant="outline"
            className="w-full border-border text-muted-foreground hover:text-foreground sm:w-auto"
            disabled={isLoading || isCampaignHistoryLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
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
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded border border-border bg-card p-1 text-muted-foreground sm:grid-cols-3 lg:inline-grid lg:w-auto">
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
        </TabsList>

        <TabsContent value="compose" className="mt-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className={cn(panelClass, "p-4 lg:p-5")}>
              <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Campaign content
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {content.length} characters
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex">
                  {channels.map((item) => {
                    const Icon = item.icon;
                    const isSelected = channel === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                          setChannel(item.value);
                          setTestTarget("");
                          if (item.value !== "whatsapp") {
                            setWhatsAppTemplateName("");
                            setWhatsAppTemplateLanguage("en");
                            setWhatsAppTemplateParamsText("");
                          }
                        }}
                        className={cn(
                          "inline-flex h-9 items-center justify-center gap-2 rounded border px-3 text-sm font-medium transition",
                          isSelected
                            ? "border-brand-secondary-500/40 bg-brand-secondary-500/15 text-brand-secondary-200"
                            : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                          item.disabled &&
                            "cursor-not-allowed opacity-45 hover:bg-card hover:text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field
                  label={channel === "whatsapp" ? "Campaign name" : "Subject"}
                  htmlFor="campaign-subject"
                >
                  <Input
                    id="campaign-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder={
                      channel === "whatsapp"
                        ? "Internal campaign title"
                        : "Email subject"
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Schedule" htmlFor="newsletter-schedule">
                  <Input
                    id="newsletter-schedule"
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(event) => setScheduleAt(event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              {channel === "whatsapp" ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Template name" htmlFor="whatsapp-template-name">
                    <Input
                      id="whatsapp-template-name"
                      value={whatsAppTemplateName}
                      onChange={(event) =>
                        setWhatsAppTemplateName(event.target.value)
                      }
                      placeholder="promo_launch_v1"
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="Template language"
                    htmlFor="whatsapp-template-language"
                  >
                    <Input
                      id="whatsapp-template-language"
                      value={whatsAppTemplateLanguage}
                      onChange={(event) =>
                        setWhatsAppTemplateLanguage(event.target.value)
                      }
                      placeholder="en"
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="Template params"
                    htmlFor="whatsapp-template-params"
                  >
                    <Input
                      id="whatsapp-template-params"
                      value={whatsAppTemplateParamsText}
                      onChange={(event) =>
                        setWhatsAppTemplateParamsText(event.target.value)
                      }
                      placeholder="Kwame, 15%"
                      className={inputClass}
                    />
                  </Field>
                </div>
              ) : null}

              <Field
                label="Message"
                htmlFor="campaign-content"
                className="mt-4"
              >
                <Textarea
                  id="campaign-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={contentPlaceholder}
                  rows={16}
                  className={cn(
                    inputClass,
                    "min-h-90 resize-y leading-6 shadow-none",
                  )}
                />
              </Field>
            </section>

            <aside className="space-y-4">
              <section className={cn(panelClass, "p-4")}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-foreground">
                    Send test
                  </h2>
                  <Badge className="border-border bg-accent/50 text-muted-foreground">
                    {channelLabel}
                  </Badge>
                </div>
                <Field label={testTargetLabel} htmlFor="newsletter-test-target">
                  <Input
                    id="newsletter-test-target"
                    value={testTarget}
                    onChange={(event) => setTestTarget(event.target.value)}
                    placeholder={testTargetPlaceholder}
                    className={inputClass}
                  />
                </Field>
                <Button
                  disabled={isSending}
                  variant="outline"
                  className="mt-4 w-full border-border text-muted-foreground hover:text-foreground"
                  onClick={() => void handleSendCampaign("test")}
                >
                  <Mail className="h-4 w-4" />
                  Send Test
                </Button>
              </section>

              <section className={cn(panelClass, "p-4")}>
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-secondary-300" />
                  <h2 className="text-sm font-semibold text-foreground">Audience</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Status" htmlFor="newsletter-audience-status">
                    <select
                      id="newsletter-audience-status"
                      value={audienceStatus}
                      onChange={(event) =>
                        setAudienceStatus(
                          event.target.value as AudienceStatusFilter,
                        )
                      }
                      className={selectClass}
                    >
                      <option value="active">Active</option>
                      <option value="all">All</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </select>
                  </Field>
                  <Field label="Source" htmlFor="newsletter-audience-source">
                    <Input
                      id="newsletter-audience-source"
                      value={audienceSource}
                      onChange={(event) =>
                        setAudienceSource(event.target.value)
                      }
                      placeholder="footer"
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <Field label="Subscribed after" htmlFor="audience-after">
                      <Input
                        id="audience-after"
                        type="datetime-local"
                        value={audienceSubscribedAfter}
                        onChange={(event) =>
                          setAudienceSubscribedAfter(event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Subscribed before" htmlFor="audience-before">
                      <Input
                        id="audience-before"
                        type="datetime-local"
                        value={audienceSubscribedBefore}
                        onChange={(event) =>
                          setAudienceSubscribedBefore(event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className={cn(panelClass, "p-4")}>
                <div className="mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-secondary-300" />
                  <h2 className="text-sm font-semibold text-foreground">Delivery</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Batch size" htmlFor="newsletter-batch-size">
                    <Input
                      id="newsletter-batch-size"
                      type="number"
                      min={1}
                      max={500}
                      value={batchSize}
                      onChange={(event) => setBatchSize(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Delay ms" htmlFor="newsletter-delay">
                    <Input
                      id="newsletter-delay"
                      type="number"
                      min={0}
                      max={10000}
                      value={sendDelayMs}
                      onChange={(event) => setSendDelayMs(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field
                  label="Recipient limit"
                  htmlFor="newsletter-limit"
                  className="mt-3"
                >
                  <Input
                    id="newsletter-limit"
                    type="number"
                    min={1}
                    value={recipientLimit}
                    onChange={(event) => setRecipientLimit(event.target.value)}
                    placeholder="No limit"
                    className={inputClass}
                  />
                </Field>

                <div className="mt-4 rounded border border-border bg-card">
                  <div className="grid grid-cols-1 gap-0 border-b border-border sm:grid-cols-2 sm:divide-x sm:divide-white/10">
                    <div className="p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Targets
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {estimatedAudience}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Send time
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {scheduleAt ? safeDate(scheduleAt, "MMM d, p") : "Now"}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 text-xs text-muted-foreground">
                    {channelLabel} / {audienceStatus}
                    {audienceSource ? ` / ${audienceSource}` : ""}
                  </div>
                </div>

                <Button
                  disabled={isSending}
                  className="mt-4 w-full bg-brand-secondary-600 text-white hover:bg-brand-secondary-500"
                  onClick={() => void handleSendCampaign("live")}
                >
                  <Send className="h-4 w-4" />
                  {scheduleAt ? "Schedule Campaign" : "Send Campaign"}
                </Button>
              </section>
            </aside>
          </div>
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
      </Tabs>
    </div>
  );
}
