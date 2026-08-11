export type CampaignChannel = "email" | "sms" | "whatsapp";
export type AudienceStatus = "active" | "unsubscribed" | "all";
export type CampaignStatus = "scheduled" | "sending" | "sent" | "failed";

export interface NewsletterCampaignInput {
  channel: CampaignChannel;
  subject: string;
  content: string;
  testEmail?: string | null;
  testPhone?: string | null;
  whatsappTemplateName?: string | null;
  whatsappTemplateLanguage: string;
  whatsappTemplateParams: string[];
  batchSize: number;
  sendDelayMs: number;
  recipientLimit?: number | null;
  scheduleAt?: Date | null;
  audienceStatus: AudienceStatus;
  audienceSource?: string | null;
  audienceSubscribedAfter?: Date | null;
  audienceSubscribedBefore?: Date | null;
}

export interface NewsletterCampaignSendOptions {
  requestId?: string;
}

export interface NewsletterRecipient {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  unsubscribeToken: string | null;
}

export interface NewsletterCampaignRow {
  id: string;
  channel?: CampaignChannel | null;
  subject: string;
  content: string;
  whatsappTemplateName?: string | null;
  whatsappTemplateLanguage?: string | null;
  whatsappTemplateParams?: string[] | string | null;
  audienceStatus?: AudienceStatus | null;
  audienceSource?: string | null;
  audienceSubscribedAfter?: Date | string | null;
  audienceSubscribedBefore?: Date | string | null;
  recipientLimit?: number | string | null;
  batchSize?: number | string | null;
  sendDelayMs?: number | string | null;
  sentCount?: number | string | null;
  failedCount?: number | string | null;
  totalTargets?: number | string | null;
}
