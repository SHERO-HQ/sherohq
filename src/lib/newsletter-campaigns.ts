import { v4 as uuidv4 } from "uuid";
import { query } from "./db";
import { notificationService } from "./notifications";

type CampaignChannel = "email" | "sms" | "whatsapp";
type AudienceStatus = "active" | "unsubscribed" | "all";
type CampaignStatus = "scheduled" | "sending" | "sent" | "failed";

interface NewsletterCampaignInput {
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

interface NewsletterCampaignSendOptions {
  requestId?: string;
}

interface NewsletterRecipient {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  unsubscribeToken: string | null;
}

interface NewsletterCampaignRow {
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

export class NewsletterCampaignValidationError extends Error {
  status = 400;
}

export class NewsletterCampaignDeliveryError extends Error {
  status = 502;
}

const VALID_CHANNELS = new Set<CampaignChannel>(["email", "sms", "whatsapp"]);
const VALID_AUDIENCE_STATUSES = new Set<AudienceStatus>([
  "active",
  "unsubscribed",
  "all",
]);

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function parseOptionalDate(value: unknown, fieldName: string): Date | null {
  const trimmed = asTrimmedString(value);
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new NewsletterCampaignValidationError(
      `${fieldName} must be a valid date`,
    );
  }

  return parsed;
}

function parseInteger(
  value: unknown,
  fieldName: string,
  fallback: number,
  min: number,
): number {
  if (value === undefined || value === null || value === "") return fallback;

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new NewsletterCampaignValidationError(
      `${fieldName} must be ${min} or more`,
    );
  }

  return parsed;
}

function parseOptionalInteger(
  value: unknown,
  fieldName: string,
  min: number,
): number | null {
  if (value === undefined || value === null || value === "") return null;

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new NewsletterCampaignValidationError(
      `${fieldName} must be ${min} or more`,
    );
  }

  return parsed;
}

function parseTemplateParams(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parseTemplateParams(parsed);
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  return [];
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(value: string): string {
  const compact = value.replace(/[^\d+]/g, "");
  if (!compact) return compact;
  // WhatsApp API requires E.164 format with + prefix
  return compact.startsWith("+") ? compact : `+${compact}`;
}

function normalizeSmsPhone(value: string): string {
  const compact = value.replace(/[^\d+]/g, "");
  if (!compact) return compact;
  return compact.startsWith("+") ? compact : `+${compact}`;
}

function getTwilioSmsConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

  if (!accountSid || !authToken) {
    return null;
  }

  return {
    accountSid,
    authToken,
    fromNumber: fromNumber || null,
    messagingServiceSid: messagingServiceSid || null,
  };
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getLogPrefix(requestId?: string): string {
  return requestId ? `[Newsletter ${requestId}]` : "[Newsletter]";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : String(error);
}

function deliveryErrorForChannel(
  channel: CampaignChannel,
  error: unknown,
): NewsletterCampaignDeliveryError {
  if (error instanceof NewsletterCampaignDeliveryError) return error;

  const label =
    channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Email";
  const message = getErrorMessage(error);
  const prefix = `${label} delivery failed`;

  return new NewsletterCampaignDeliveryError(
    message.startsWith(prefix) ? message : `${prefix}: ${message}`,
  );
}

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

function audienceWhere(input: NewsletterCampaignInput) {
  const clauses: string[] = [];
  const values: string[] = [];

  if (input.audienceStatus !== "all") {
    values.push(input.audienceStatus);
    clauses.push(`status = $${values.length}`);
  }

  if (input.audienceSource) {
    values.push(input.audienceSource);
    clauses.push(`source = $${values.length}`);
  }

  if (input.audienceSubscribedAfter) {
    values.push(input.audienceSubscribedAfter.toISOString());
    clauses.push(`"subscribedAt" >= $${values.length}`);
  }

  if (input.audienceSubscribedBefore) {
    values.push(input.audienceSubscribedBefore.toISOString());
    clauses.push(`"subscribedAt" <= $${values.length}`);
  }

  if (input.channel === "email") {
    clauses.push("email IS NOT NULL AND email <> ''");
  } else {
    clauses.push("phone IS NOT NULL AND phone <> ''");
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

async function countAudience(input: NewsletterCampaignInput): Promise<number> {
  const { whereSql, values } = audienceWhere(input);
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM newsletter_subscribers ${whereSql}`,
    values,
  );
  const count = Number(result.rows[0]?.count || 0);
  return input.recipientLimit ? Math.min(count, input.recipientLimit) : count;
}

async function fetchAudience(
  input: NewsletterCampaignInput,
  options: { limit?: number | null; offset?: number } = {},
): Promise<NewsletterRecipient[]> {
  const { whereSql, values } = audienceWhere(input);
  const params: Array<string | number> = [...values];
  const limit = options.limit ?? input.recipientLimit;
  const offset = options.offset || 0;
  const limitSql = limit ? `LIMIT $${params.push(limit)}` : "";
  const offsetSql = offset > 0 ? `OFFSET $${params.push(offset)}` : "";

  const result = await query(
    `SELECT id, email, phone, name, "unsubscribeToken"
     FROM newsletter_subscribers
     ${whereSql}
     ORDER BY "subscribedAt" ASC
     ${limitSql}
     ${offsetSql}`,
    params,
  );

  return result.rows;
}

async function sendWhatsAppMessage(
  phone: string,
  input: NewsletterCampaignInput,
  requestId?: string,
): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = normalizePhone(phone);
  const logPrefix = getLogPrefix(requestId);

  if (!accessToken || !phoneNumberId) {
    if (process.env.NODE_ENV === "production") {
      throw new NewsletterCampaignDeliveryError(
        "WhatsApp delivery is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
      );
    }

    console.log(
      `${logPrefix} [WhatsApp Simulation] To: ${recipient}, Subject: ${input.subject}`,
    );
    return;
  }

  const body = input.whatsappTemplateName
    ? {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: input.whatsappTemplateName,
          language: { code: input.whatsappTemplateLanguage },
          ...(input.whatsappTemplateParams.length > 0
            ? {
                components: [
                  {
                    type: "body",
                    parameters: input.whatsappTemplateParams.map((text) => ({
                      type: "text",
                      text,
                    })),
                  },
                ],
              }
            : {}),
        },
      }
    : {
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body: input.content },
      };

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    let providerMessage = errorText;

    try {
      const parsed = JSON.parse(errorText) as {
        error?: { message?: string };
        message?: string;
      };
      providerMessage = parsed.error?.message || parsed.message || errorText;
    } catch {
      providerMessage = errorText;
    }

    const fullError = `WhatsApp API error ${response.status}: ${providerMessage.slice(0, 300)}`;
    console.error(`${getLogPrefix(requestId)} ${fullError}`, {
      status: response.status,
      phone: recipient,
      errorText,
    });

    throw new NewsletterCampaignDeliveryError(fullError);
  }
}

async function sendSmsMessage(
  phone: string,
  input: NewsletterCampaignInput,
  requestId?: string,
): Promise<void> {
  const config = getTwilioSmsConfig();
  const recipient = normalizeSmsPhone(phone);

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new NewsletterCampaignDeliveryError(
        "SMS delivery is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN, plus TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID.",
      );
    }

    console.log(
      `${getLogPrefix(requestId)} [SMS Simulation] To: ${recipient}, Subject: ${input.subject}`,
    );
    return;
  }

  const payload = new URLSearchParams({
    To: recipient,
    Body: input.content,
  });

  if (config.messagingServiceSid) {
    payload.set("MessagingServiceSid", config.messagingServiceSid);
  } else if (config.fromNumber) {
    payload.set("From", normalizeSmsPhone(config.fromNumber));
  } else {
    throw new NewsletterCampaignDeliveryError(
      "SMS delivery is not configured. Set TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID.",
    );
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.accountSid}:${config.authToken}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    let providerMessage = errorText;

    try {
      const parsed = JSON.parse(errorText) as {
        message?: string;
        error_message?: string;
      };
      providerMessage = parsed.error_message || parsed.message || errorText;
    } catch {
      providerMessage = errorText;
    }

    throw new NewsletterCampaignDeliveryError(
      `Twilio SMS API error ${response.status}: ${providerMessage.slice(0, 300)}`,
    );
  }
}

async function sendToRecipient(
  input: NewsletterCampaignInput,
  recipient: NewsletterRecipient,
  requestId?: string,
): Promise<void> {
  if (input.channel === "email") {
    if (!recipient.email) throw new Error("Recipient email is missing");
    const unsubscribeUrl = `${getSiteUrl()}/newsletter/unsubscribe/${recipient.unsubscribeToken || ""}`;
    await notificationService.sendNewsletterCampaignEmail(
      recipient.email,
      input.subject,
      input.content,
      unsubscribeUrl,
      requestId,
    );
    return;
  }

  if (!recipient.phone) throw new Error("Recipient phone is missing");

  if (input.channel === "whatsapp") {
    await sendWhatsAppMessage(recipient.phone, input, requestId);
    return;
  }

  await sendSmsMessage(recipient.phone, input, requestId);
}

async function markSubscribersContacted(recipientIds: string[]): Promise<void> {
  if (recipientIds.length === 0) return;

  await query(
    `UPDATE newsletter_subscribers
     SET "lastCampaignAt" = NOW(), "updatedAt" = NOW()
     WHERE id = ANY($1::text[])`,
    [recipientIds],
  );
}

async function updateCampaignCounts(
  campaignId: string,
  sent: number,
  failed: number,
): Promise<void> {
  await query(
    `UPDATE newsletter_campaigns
     SET "sentCount" = COALESCE("sentCount", 0) + $1,
         "failedCount" = COALESCE("failedCount", 0) + $2,
         "updatedAt" = NOW()
     WHERE id = $3`,
    [sent, failed, campaignId],
  );
}

async function deliverRecipients(
  campaignId: string,
  input: NewsletterCampaignInput,
  recipients: NewsletterRecipient[],
  requestId?: string,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const successfulRecipientIds: string[] = [];
  const logPrefix = getLogPrefix(requestId);

  for (let start = 0; start < recipients.length; start += input.batchSize) {
    const batch = recipients.slice(start, start + input.batchSize);

    for (const recipient of batch) {
      /* Newsletter sending log removed for production */
      try {
        await sendToRecipient(input, recipient, requestId);
        sent += 1;
        successfulRecipientIds.push(recipient.id);
      } catch (error) {
        failed += 1;
        if (process.env.NODE_ENV !== "production") {
          console.error(`${logPrefix} Newsletter recipient send failed:`, {
            campaignId,
            recipientId: recipient.id,
            error,
          });
        }
      }
    }

    await updateCampaignCounts(campaignId, sent, failed);
    sent = 0;
    failed = 0;

    if (input.sendDelayMs > 0 && start + input.batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, input.sendDelayMs));
    }
  }

  await markSubscribersContacted(successfulRecipientIds);

  const totals = await query(
    `SELECT COALESCE("sentCount", 0)::int AS sent,
            COALESCE("failedCount", 0)::int AS failed
     FROM newsletter_campaigns
     WHERE id = $1`,
    [campaignId],
  );

  return {
    sent: Number(totals.rows[0]?.sent || 0),
    failed: Number(totals.rows[0]?.failed || 0),
  };
}

async function insertCampaign(
  input: NewsletterCampaignInput,
  status: CampaignStatus,
  totalTargets: number,
): Promise<string> {
  const id = uuidv4();

  await query(
    `INSERT INTO newsletter_campaigns (
       id,
       channel,
       subject,
       content,
       status,
       "whatsappTemplateName",
       "whatsappTemplateLanguage",
       "whatsappTemplateParams",
       "audienceStatus",
       "audienceSource",
       "audienceSubscribedAfter",
       "audienceSubscribedBefore",
       "recipientLimit",
       "batchSize",
       "sendDelayMs",
       "isTest",
       "testEmail",
       "testPhone",
       "totalTargets",
       "sentCount",
       "failedCount",
       "scheduledAt",
       "createdAt",
       "updatedAt"
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9,
       $10, $11, $12, $13, $14, $15, false, $16, $17,
       $18, 0, 0, $19, NOW(), NOW()
     )`,
    [
      id,
      input.channel,
      input.subject,
      input.content,
      status,
      input.whatsappTemplateName,
      input.whatsappTemplateLanguage,
      JSON.stringify(input.whatsappTemplateParams),
      input.audienceStatus,
      input.audienceSource,
      input.audienceSubscribedAfter?.toISOString() || null,
      input.audienceSubscribedBefore?.toISOString() || null,
      input.recipientLimit,
      input.batchSize,
      input.sendDelayMs,
      input.testEmail,
      input.testPhone,
      totalTargets,
      input.scheduleAt?.toISOString() || null,
    ],
  );

  return id;
}

async function finalizeCampaign(campaignId: string): Promise<void> {
  await query(
    `UPDATE newsletter_campaigns
     SET status = CASE
           WHEN COALESCE("sentCount", 0) = 0 AND COALESCE("failedCount", 0) > 0
             THEN 'failed'
           ELSE 'sent'
         END,
         "sentAt" = NOW(),
         "updatedAt" = NOW()
     WHERE id = $1`,
    [campaignId],
  );
}

async function sendTestCampaign(
  input: NewsletterCampaignInput,
  requestId?: string,
) {
  const recipient: NewsletterRecipient = {
    id: "test",
    email: input.testEmail || null,
    phone: input.testPhone || null,
    name: "Test Recipient",
    unsubscribeToken: "test",
  };

  if (process.env.NODE_ENV !== "production") {
    console.log(`${getLogPrefix(requestId)} Newsletter test send:`, {
      channel: input.channel,
      testEmail: input.testEmail || null,
      testPhone: input.testPhone || null,
    });
  }

  try {
    await sendToRecipient(input, recipient, requestId);
  } catch (error) {
    throw deliveryErrorForChannel(input.channel, error);
  }

  return {
    success: true,
    sent: 1,
    failed: 0,
    totalTargets: 1,
    message: `${input.channel.toUpperCase()} test sent successfully`,
  };
}

export async function sendNewsletterCampaign(
  input: NewsletterCampaignInput,
  options: NewsletterCampaignSendOptions = {},
) {
  if (input.testEmail || input.testPhone) {
    return sendTestCampaign(input, options.requestId);
  }

  const totalTargets = await countAudience(input);
  if (totalTargets === 0) {
    throw new NewsletterCampaignValidationError("No matching recipients found");
  }

  const scheduleAt = input.scheduleAt;
  const isScheduled = Boolean(scheduleAt && scheduleAt.getTime() > Date.now());
  const campaignId = await insertCampaign(
    input,
    isScheduled ? "scheduled" : "sending",
    totalTargets,
  );

  if (isScheduled) {
    return {
      success: true,
      campaignId,
      status: "scheduled" as const,
      totalTargets,
      batchSize: input.batchSize,
      sendDelayMs: input.sendDelayMs,
      message: `Campaign scheduled for ${scheduleAt?.toLocaleString()}`,
    };
  }

  // Start background processing in a non-blocking way
  (async () => {
    try {
      const logPrefix = getLogPrefix(options.requestId);
      if (process.env.NODE_ENV !== "production") {
        console.log(`${logPrefix} Starting background delivery for campaign ${campaignId}`);
      }

      let attempted = 0;
      while (attempted < totalTargets) {
        const remaining = totalTargets - attempted;
        if (remaining <= 0) break;

        const batchRecipients = await fetchAudience(input, {
          limit: Math.min(input.batchSize, remaining),
          offset: attempted,
        });

        if (batchRecipients.length === 0) break;

        await deliverRecipients(campaignId, input, batchRecipients, options.requestId);
        attempted += batchRecipients.length;

        // Apply delay between batches if configured
        if (attempted < totalTargets && input.sendDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, input.sendDelayMs));
        }
      }

      await finalizeCampaign(campaignId);
      if (process.env.NODE_ENV !== "production") {
        console.log(`${logPrefix} Background delivery completed for campaign ${campaignId}`);
      }
    } catch (error) {
      console.error(`❌ Background delivery failed for campaign ${campaignId}:`, error);
    }
  })();

  return {
    success: true,
    campaignId,
    status: "sending" as const,
    sent: 0,
    failed: 0,
    totalTargets,
    batchSize: input.batchSize,
    sendDelayMs: input.sendDelayMs,
    message: `Campaign started in the background. Check history for progress.`,
  };
}

function dateFromRow(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function inputFromCampaign(
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

export async function processDueNewsletterCampaign() {
  const dueResult = await query(`
    WITH due AS (
      SELECT id
      FROM newsletter_campaigns
      WHERE (status = 'scheduled' AND "scheduledAt" <= NOW())
         OR (
           status = 'sending'
           AND (
             "updatedAt" IS NULL
             OR "updatedAt" <= NOW() - INTERVAL '30 seconds'
           )
         )
      ORDER BY "updatedAt" ASC NULLS FIRST
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE newsletter_campaigns c
    SET status = 'sending', "updatedAt" = NOW()
    FROM due
    WHERE c.id = due.id
    RETURNING c.*
  `);

  if (dueResult.rowCount === 0) {
    return {
      success: true,
      processed: 0,
      message: "No due newsletter campaigns found",
    };
  }

  const campaign = dueResult.rows[0] as NewsletterCampaignRow;
  const input = inputFromCampaign(campaign);
  const sentCount = Number(campaign.sentCount || 0);
  const failedCount = Number(campaign.failedCount || 0);
  const attemptedCount = sentCount + failedCount;
  const totalTargets = Number(campaign.totalTargets || 0);
  const remaining = Math.max(totalTargets - attemptedCount, 0);

  if (remaining === 0) {
    await finalizeCampaign(campaign.id);
    return {
      success: true,
      processed: 0,
      campaignId: campaign.id,
      message: "Campaign completed",
    };
  }

  const recipients = await fetchAudience(input, {
    limit: Math.min(input.batchSize, remaining),
    offset: attemptedCount,
  });

  if (recipients.length === 0) {
    await finalizeCampaign(campaign.id);
    return {
      success: true,
      processed: 0,
      campaignId: campaign.id,
      message: "Campaign completed",
    };
  }

  const beforeAttempted = attemptedCount;
  await deliverRecipients(campaign.id, input, recipients);

  const nextAttempted = beforeAttempted + recipients.length;
  if (nextAttempted >= totalTargets) {
    await finalizeCampaign(campaign.id);
  }

  return {
    success: true,
    processed: recipients.length,
    campaignId: campaign.id,
    message: `Processed ${recipients.length} newsletter recipient(s)`,
  };
}
