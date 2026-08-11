import { Search } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { type NewsletterSubscriber } from "@/services/api";

type SubscriberFilter = "all" | "active" | "unsubscribed";

const inputClass =
  "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-brand-secondary-500/70 focus-visible:ring-brand-secondary-500/20";

const selectClass =
  "h-9 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-brand-secondary-500/70 focus:ring-2 focus:ring-brand-secondary-500/20";

function safeDate(value?: string | null, pattern = "PPP") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, pattern);
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}

interface NewsletterSubscribersTabProps {
  subscribers: NewsletterSubscriber[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: SubscriberFilter;
  setStatusFilter: (val: SubscriberFilter) => void;
  editingSubscriberId: string | null;
  editPhoneValue: string;
  setEditPhoneValue: (val: string) => void;
  isSavingContact: boolean;
  onSaveSubscriberContact: (id: string) => void;
  onCancelEditSubscriber: () => void;
  onStartEditSubscriber: (subscriber: NewsletterSubscriber) => void;
  onStatusChange: (
    subscriber: NewsletterSubscriber,
    nextStatus: "active" | "unsubscribed",
  ) => void;
}

export function NewsletterSubscribersTab({
  subscribers,
  isLoading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  editingSubscriberId,
  editPhoneValue,
  setEditPhoneValue,
  isSavingContact,
  onSaveSubscriberContact,
  onCancelEditSubscriber,
  onStartEditSubscriber,
  onStatusChange,
}: NewsletterSubscribersTabProps) {
  return (
    <TabsContent value="subscribers" className="mt-5">
      <section className="rounded border border-border bg-card shadow-sm shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Subscribers
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {subscribers.length} visible records
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,280px)_170px]">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search subscribers"
              leftIcon={<Search className="h-4 w-4" />}
              className={inputClass}
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as SubscriberFilter)
              }
              className={selectClass}
              aria-label="Subscriber status filter"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <EmptyState title="Loading subscribers..." />
          ) : subscribers.length === 0 ? (
            <EmptyState title="No subscribers found for this filter." />
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-22rem)]">
              <table className="w-full min-w-55 text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground bg-card">
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 font-semibold">Subscriber</th>
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 font-semibold">Phone</th>
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 font-semibold">Source</th>
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 font-semibold">Subscribed</th>
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 font-semibold">Last campaign</th>
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 font-semibold">Status</th>
                    <th className="sticky top-0 z-10 bg-card border-b border-border px-3 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="border-b border-border text-muted-foreground transition hover:bg-muted/50"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-foreground">
                          {subscriber.email}
                        </div>
                        {subscriber.name ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {subscriber.name}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-4">
                        {editingSubscriberId === subscriber.id ? (
                          <Input
                            value={editPhoneValue}
                            onChange={(event) =>
                              setEditPhoneValue(event.target.value)
                            }
                            placeholder="+233XXXXXXXXX"
                            className={cn(inputClass, "h-8")}
                          />
                        ) : (
                          subscriber.phone || "-"
                        )}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {subscriber.source || "-"}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {safeDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {safeDate(subscriber.lastCampaignAt)}
                      </td>
                      <td className="px-3 py-4">
                        <Badge
                          className={
                            subscriber.status === "active"
                              ? "border-brand-secondary-500/20 bg-brand-secondary-500/10 text-brand-secondary-300"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                          }
                        >
                          {subscriber.status === "active" ? "Active" : "Unsubscribed"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                          {editingSubscriberId === subscriber.id ? (
                            <>
                              <Button
                                size="sm"
                                className="h-8 bg-brand-secondary-600 text-white hover:bg-brand-secondary-500"
                                disabled={isSavingContact}
                                onClick={() => onSaveSubscriberContact(subscriber.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-border text-muted-foreground hover:text-foreground"
                                disabled={isSavingContact}
                                onClick={onCancelEditSubscriber}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-border text-muted-foreground hover:text-foreground"
                                onClick={() => onStartEditSubscriber(subscriber)}
                              >
                                Edit Phone
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-border text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  onStatusChange(
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
        </div>
      </section>
    </TabsContent>
  );
}
