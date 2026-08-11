import { notificationService } from "../notifications";
import { NewsletterCampaignDeliveryError, NewsletterCampaignValidationError } from "./errors";
import { countAudience, fetchAudience, fetchDueCampaign, finalizeCampaign, getCampaignCounts, insertCampaign, markSubscribersContacted, setCampaignDeliveryStats, updateCampaignCounts } from "./queries";
import { NewsletterCampaignInput, NewsletterCampaignSendOptions, NewsletterRecipient } from "./types";
import { deliveryErrorForChannel, getLogPrefix, getSiteUrl, getTwilioSmsConfig, normalizePhone, normalizeSmsPhone } from "./utils";
import { inputFromCampaign } from "./validation";

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
  return getCampaignCounts(campaignId);
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

  (async () => {
    try {
      const logPrefix = getLogPrefix(options.requestId);
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `${logPrefix} Starting background delivery for campaign ${campaignId}`,
        );
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

        await deliverRecipients(
          campaignId,
          input,
          batchRecipients,
          options.requestId,
        );
        attempted += batchRecipients.length;

        if (attempted < totalTargets && input.sendDelayMs > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, input.sendDelayMs),
          );
        }
      }

      await finalizeCampaign(campaignId);
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `${logPrefix} Background delivery completed for campaign ${campaignId}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Background delivery failed for campaign ${campaignId}:`,
        error,
      );
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

export async function processDueNewsletterCampaign() {
  const campaign = await fetchDueCampaign();

  if (!campaign) {
    return {
      success: true,
      processed: 0,
      message: "No due newsletter campaigns found",
    };
  }

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

export async function updateCampaignDeliveryStats(
  campaignId: string,
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  },
): Promise<void> {
  return setCampaignDeliveryStats(campaignId, stats);
}
