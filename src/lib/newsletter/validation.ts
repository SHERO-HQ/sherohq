import { NewsletterCampaignValidationError } from "./errors";
import { AudienceStatus, CampaignChannel, NewsletterCampaignInput, NewsletterCampaignRow } from "./types";
import {
  asTrimmedString,
  isLikelyEmail,
  parseInteger,
  parseOptionalDate,
  parseOptionalInteger,
  parseTemplateParams,
  dateFromRow
} from "./utils";

const VALID_CHANNELS = new Set<CampaignChannel>(["email", "sms", "whatsapp"]);
const VALID_AUDIENCE_STATUSES = new Set<AudienceStatus>([
  "active",
  "unsubscribed",
  "all",
]);

export function normalizeNewsletterCampaignInput(
  body: Record<string, unknown>,
): NewsletterCampaignInput {
  const channelValue = asTrimmedString(body.channel) || "email";
  if (!VALID_CHANNELS.has(channelValue as CampaignChannel)) {
    throw new NewsletterCampaignValidationError(
      "Channel must be email, sms, or whatsapp",
    );
  }

  const audienceStatusValue = asTrimmedString(body.audienceStatus) || "active";
  if (!VALID_AUDIENCE_STATUSES.has(audienceStatusValue as AudienceStatus)) {
    throw new NewsletterCampaignValidationError(
      "Audience status must be active, unsubscribed, or all",
    );
  }

  const subject = asTrimmedString(body.subject);
  const content = asTrimmedString(body.content);
  if (!subject || !content) {
    throw new NewsletterCampaignValidationError(
      "Subject and content are required",
    );
  }

  const channel = channelValue as CampaignChannel;
  const testEmail = asTrimmedString(body.testEmail)?.toLowerCase() || null;
  const testPhone = asTrimmedString(body.testPhone) || null;
  const isTest = Boolean(testEmail || testPhone);

  if (isTest) {
    if (channel === "email" && (!testEmail || !isLikelyEmail(testEmail))) {
      throw new NewsletterCampaignValidationError(
        "A valid test email is required",
      );
    }

    if (channel !== "email" && !testPhone) {
      throw new NewsletterCampaignValidationError(
        "A test phone number is required",
      );
    }
  }

  const whatsappTemplateName =
    asTrimmedString(body.whatsappTemplateName) || null;

  if (channel === "whatsapp" && !whatsappTemplateName) {
    throw new NewsletterCampaignValidationError(
      "WhatsApp campaigns require an approved template name",
    );
  }

  const recipientLimit = parseOptionalInteger(
    body.limit ?? body.recipientLimit,
    "Recipient limit",
    1,
  );

  return {
    channel,
    subject,
    content,
    testEmail,
    testPhone,
    whatsappTemplateName,
    whatsappTemplateLanguage:
      asTrimmedString(body.whatsappTemplateLanguage) || "en",
    whatsappTemplateParams: parseTemplateParams(body.whatsappTemplateParams),
    batchSize: parseInteger(body.batchSize, "Batch size", 100, 1),
    sendDelayMs: parseInteger(body.sendDelayMs, "Send delay", 0, 0),
    recipientLimit,
    scheduleAt: parseOptionalDate(
      body.scheduleAt ?? body.scheduledAt,
      "Schedule date",
    ),
    audienceStatus: audienceStatusValue as AudienceStatus,
    audienceSource: asTrimmedString(body.audienceSource) || null,
    audienceSubscribedAfter: parseOptionalDate(
      body.audienceSubscribedAfter,
      "Audience subscribed after",
    ),
    audienceSubscribedBefore: parseOptionalDate(
      body.audienceSubscribedBefore,
      "Audience subscribed before",
    ),
  };
}

export function inputFromCampaign(
  row: NewsletterCampaignRow,
): NewsletterCampaignInput {
  return {
    channel: row.channel || "email",
    subject: row.subject,
    content: row.content,
    whatsappTemplateName: row.whatsappTemplateName || null,
    whatsappTemplateLanguage: row.whatsappTemplateLanguage || "en",
    whatsappTemplateParams: parseTemplateParams(row.whatsappTemplateParams),
    batchSize: Number(row.batchSize || 100),
    sendDelayMs: Number(row.sendDelayMs || 0),
    recipientLimit:
      row.recipientLimit === null || row.recipientLimit === undefined
        ? null
        : Number(row.recipientLimit),
    audienceStatus: row.audienceStatus || "active",
    audienceSource: row.audienceSource || null,
    audienceSubscribedAfter: dateFromRow(row.audienceSubscribedAfter),
    audienceSubscribedBefore: dateFromRow(row.audienceSubscribedBefore),
  };
}
