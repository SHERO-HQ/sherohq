"use client";

import React, { ReactNode } from "react";
import { Mail, MessageCircle, Send, Users, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TemplatePreview } from "./TemplatePreview";

type CampaignChannel = "email" | "sms" | "whatsapp";
type AudienceStatusFilter = "active" | "unsubscribed" | "all";

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
  className,
}: {
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

function safeDate(value?: string | null, pattern = "PPP") {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" });
}

interface NewsletterComposerTabProps {
  channel: CampaignChannel;
  setChannel: (ch: CampaignChannel) => void;
  subject: string;
  setSubject: (sub: string) => void;
  scheduleAt: string;
  setScheduleAt: (sch: string) => void;
  whatsAppTemplateName: string;
  setWhatsAppTemplateName: (val: string) => void;
  whatsAppTemplateLanguage: string;
  setWhatsAppTemplateLanguage: (val: string) => void;
  whatsAppTemplateParamsText: string;
  setWhatsAppTemplateParamsText: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  contentPlaceholder: string;
  testTarget: string;
  setTestTarget: (val: string) => void;
  testTargetLabel: string;
  testTargetPlaceholder: string;
  channelLabel: string;
  audienceStatus: AudienceStatusFilter;
  setAudienceStatus: (st: AudienceStatusFilter) => void;
  audienceSource: string;
  setAudienceSource: (src: string) => void;
  audienceSubscribedAfter: string;
  setAudienceSubscribedAfter: (val: string) => void;
  audienceSubscribedBefore: string;
  setAudienceSubscribedBefore: (val: string) => void;
  batchSize: string;
  setBatchSize: (val: string) => void;
  sendDelayMs: string;
  setSendDelayMs: (val: string) => void;
  recipientLimit: string;
  setRecipientLimit: (val: string) => void;
  estimatedAudience: number | string;
  isSending: boolean;
  handleSendCampaign: (mode: "test" | "live") => Promise<void>;
}

export function NewsletterComposerTab({
  channel,
  setChannel,
  subject,
  setSubject,
  scheduleAt,
  setScheduleAt,
  whatsAppTemplateName,
  setWhatsAppTemplateName,
  whatsAppTemplateLanguage,
  setWhatsAppTemplateLanguage,
  whatsAppTemplateParamsText,
  setWhatsAppTemplateParamsText,
  content,
  setContent,
  contentPlaceholder,
  testTarget,
  setTestTarget,
  testTargetLabel,
  testTargetPlaceholder,
  channelLabel,
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
  estimatedAudience,
  isSending,
  handleSendCampaign,
}: NewsletterComposerTabProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className={cn(panelClass, "p-4 lg:p-5")}>
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Campaign content</h2>
            <p className="mt-1 text-xs text-muted-foreground">{content.length} characters</p>
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
              placeholder={channel === "whatsapp" ? "Internal campaign title" : "Email subject"}
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
                onChange={(event) => setWhatsAppTemplateName(event.target.value)}
                placeholder="promo_launch_v1"
                className={inputClass}
              />
            </Field>
            <Field label="Template language" htmlFor="whatsapp-template-language">
              <Input
                id="whatsapp-template-language"
                value={whatsAppTemplateLanguage}
                onChange={(event) => setWhatsAppTemplateLanguage(event.target.value)}
                placeholder="en"
                className={inputClass}
              />
            </Field>
            <Field label="Template params" htmlFor="whatsapp-template-params">
              <Input
                id="whatsapp-template-params"
                value={whatsAppTemplateParamsText}
                onChange={(event) => setWhatsAppTemplateParamsText(event.target.value)}
                placeholder="Kwame, 15%"
                className={inputClass}
              />
            </Field>
          </div>
        ) : null}

        {/* Dynamic Preview */}
        {(channel === "whatsapp" || channel === "email") && content.trim().length > 0 && (
          <div className="mt-6 mb-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">
              Live Preview
            </Label>
            <TemplatePreview
              channel={channel}
              content={content}
              params={
                channel === "whatsapp" && whatsAppTemplateParamsText
                  ? whatsAppTemplateParamsText.split(",").map((p) => p.trim())
                  : []
              }
            />
          </div>
        )}

        <Field label="Message" htmlFor="campaign-content" className="mt-4">
          <Textarea
            id="campaign-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={contentPlaceholder}
            rows={16}
            className={cn(inputClass, "min-h-90 resize-y leading-6 shadow-none")}
          />
        </Field>
      </section>

      <aside className="space-y-4">
        <section className={cn(panelClass, "p-4")}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Send test</h2>
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
                  setAudienceStatus(event.target.value as AudienceStatusFilter)
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
                onChange={(event) => setAudienceSource(event.target.value)}
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
                  onChange={(event) => setAudienceSubscribedAfter(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Subscribed before" htmlFor="audience-before">
                <Input
                  id="audience-before"
                  type="datetime-local"
                  value={audienceSubscribedBefore}
                  onChange={(event) => setAudienceSubscribedBefore(event.target.value)}
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
          <Field label="Recipient limit" htmlFor="newsletter-limit" className="mt-3">
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
            className="mt-4 w-full bg-brand-secondary-600 text-foreground hover:bg-brand-secondary-500"
            onClick={() => void handleSendCampaign("live")}
          >
            <Send className="h-4 w-4" />
            {scheduleAt ? "Schedule Campaign" : "Send Campaign"}
          </Button>
        </section>
      </aside>
    </div>
  );
}
