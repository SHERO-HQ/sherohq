import { CalendarClock, CheckCircle2, Clock3, Play, Trash2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { type NewsletterCampaign } from "@/services/api";

function safeDate(value?: string | null, pattern = "PPP") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, pattern);
}

function statusIcon(status: NewsletterCampaign["status"]) {
  if (status === "sent") return CheckCircle2;
  if (status === "failed") return XCircle;
  if (status === "scheduled") return CalendarClock;
  return Clock3;
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}

interface NewsletterHistoryTabProps {
  campaigns: NewsletterCampaign[];
  isCampaignHistoryLoading: boolean;
  isProcessingScheduled: boolean;
  isCancellingCampaign: string | null;
  isDeletingCampaign: string | null;
  onProcessScheduled: () => void;
  onCancelCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
}

export function NewsletterHistoryTab({
  campaigns,
  isCampaignHistoryLoading,
  isProcessingScheduled,
  isCancellingCampaign,
  isDeletingCampaign,
  onProcessScheduled,
  onCancelCampaign,
  onDeleteCampaign,
}: NewsletterHistoryTabProps) {
  return (
    <TabsContent value="history" className="mt-5">
      <section className="rounded border border-border bg-card shadow-sm shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Campaign history
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {campaigns.length} recent campaigns
            </p>
          </div>
          <Button
            onClick={onProcessScheduled}
            disabled={isProcessingScheduled}
            variant="outline"
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Play className="h-4 w-4" />
            Process Scheduled
          </Button>
        </div>

        <div className="p-4">
          {isCampaignHistoryLoading ? (
            <EmptyState title="Loading campaign history..." />
          ) : campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[225px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-3 font-semibold">Campaign</th>
                    <th className="px-3 py-3 font-semibold">Channel</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Audience</th>
                    <th className="px-3 py-3 font-semibold">Delivery</th>
                    <th className="px-3 py-3 font-semibold">Scheduled</th>
                    <th className="px-3 py-3 font-semibold">Sent</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const StatusIcon = statusIcon(campaign.status);
                    const progress =
                      campaign.totalTargets > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (campaign.sentCount / campaign.totalTargets) * 100,
                            ),
                          )
                        : 0;

                    return (
                      <tr
                        key={campaign.id}
                        className="border-b border-border text-muted-foreground transition hover:bg-muted/50"
                      >
                        <td className="px-3 py-4">
                          <div className="font-medium text-foreground">
                            {campaign.subject}
                          </div>
                          {campaign.whatsappTemplateName && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Template: {campaign.whatsappTemplateName}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {campaign.channel}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className="h-3.5 w-3.5" />
                            <span className="capitalize">{campaign.status}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col gap-1">
                            <span>{campaign.audienceStatus}</span>
                            {(campaign.audienceSubscribedAfter ||
                              campaign.audienceSubscribedBefore) && (
                              <span className="text-[10px]">Filtered</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="w-32">
                            <div className="flex justify-between text-xs">
                              <span>
                                {campaign.sentCount}/{campaign.totalTargets}
                              </span>
                              <span>{progress}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded bg-muted">
                              <div
                                className="h-full rounded bg-brand-secondary-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {safeDate(campaign.scheduledAt, "MMM d, p")}
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {safeDate(campaign.sentAt, "MMM d, p")}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                            {campaign.status === "scheduled" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-sky-500/20 text-sky-300 hover:bg-sky-500/10"
                                onClick={() => onCancelCampaign(campaign.id)}
                                disabled={isCancellingCampaign === campaign.id}
                              >
                                Cancel
                              </Button>
                            ) : null}
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label={`Delete campaign ${campaign.subject}`}
                              className="h-8 w-8 border-rose-500/20 text-rose-300 hover:bg-rose-500/10"
                              onClick={() => onDeleteCampaign(campaign.id)}
                              disabled={isDeletingCampaign === campaign.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </TabsContent>
  );
}
