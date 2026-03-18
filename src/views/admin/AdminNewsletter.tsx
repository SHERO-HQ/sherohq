"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Mail, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { useNotifications } from "@/hooks/useNotifications";
import {
  fetchNewsletterSubscribers,
  sendNewsletterCampaign,
  updateNewsletterSubscriberStatus,
  type NewsletterSubscriber,
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SubscriberFilter = "all" | "active" | "unsubscribed";

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
  const [testEmail, setTestEmail] = useState("");
  const [batchSize, setBatchSize] = useState("100");
  const [sendDelayMs, setSendDelayMs] = useState("0");
  const [recipientLimit, setRecipientLimit] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const sortedSubscribers = useMemo(() => {
    return [...subscribers].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [subscribers]);

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

  const handleSendCampaign = async (mode: "test" | "live") => {
    if (!subject.trim() || !content.trim()) {
      addNotification("Warning", "Subject and content are required", "warning");
      return;
    }

    if (mode === "test" && !testEmail.trim()) {
      addNotification(
        "Warning",
        "Provide a test email before sending test",
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
      const result = await sendNewsletterCampaign({
        subject: subject.trim(),
        content,
        testEmail: mode === "test" ? testEmail.trim() : undefined,
        batchSize: parsedBatchSize,
        sendDelayMs: parsedDelay,
        limit: parsedLimit,
      });

      addNotification(
        "Success",
        result.message ||
          `Sent ${result.sent}/${result.totalTargets} emails successfully.`,
        "success",
      );

      if (mode === "live") {
        setSubject("");
        setContent("");
      }

      await loadSubscribers();
    } catch (error) {
      console.error("Newsletter campaign failed:", error);
      addNotification("Error", "Failed to send campaign", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group"
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
              <p className="text-2xl font-bold text-emerald-400">
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

        <Card className="bg-slate-900/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Campaign Composer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Campaign subject"
              className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write HTML content for your campaign..."
              rows={8}
              className="w-full rounded border border-white/10 bg-slate-900/50 p-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <div className="rounded border border-white/10 bg-slate-900/20 p-3 space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Send Test Email
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="space-y-1">
                  <label
                    htmlFor="newsletter-test-email"
                    className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                  >
                    Test Recipient Email
                  </label>
                  <Input
                    id="newsletter-test-email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Used only for Send Test"
                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
                <Button
                  disabled={isSending}
                  variant="outline"
                  className="h-10 border-white/10 text-slate-300 hover:text-white"
                  onClick={() => void handleSendCampaign("test")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                The test recipient field is ignored when sending to the active
                list.
              </p>
            </div>
            <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">
                Send Live Campaign
              </p>
              <Button
                disabled={isSending}
                className="w-full md:w-auto md:ml-auto bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => void handleSendCampaign("live")}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Active List
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                placeholder="Delay between batches in ms"
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
            </div>
            <p className="text-xs text-slate-400">
              Bulk mode sends in batches to avoid provider throttling. Leave
              recipient limit empty to send to all active subscribers.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Subscribers</CardTitle>
            <div className="flex flex-col md:flex-row gap-3 mt-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name"
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as SubscriberFilter)
                }
                className="rounded border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-slate-400 text-sm">Loading subscribers...</p>
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
                          {subscriber.source || "-"}
                        </td>
                        <td className="py-3 pr-4 text-slate-300">
                          {format(new Date(subscriber.subscribedAt), "PPP")}
                        </td>
                        <td className="py-3 pr-4 text-slate-300">
                          {subscriber.lastCampaignAt
                            ? format(new Date(subscriber.lastCampaignAt), "PPP")
                            : "-"}
                        </td>
                        <td className="py-3 pr-4">
                          {subscriber.status === "active" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                              Unsubscribed
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-slate-300 hover:text-white"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
