import { NewsletterCampaignDeliveryError, NewsletterCampaignValidationError } from "./errors";
import { CampaignChannel } from "./types";

export function asTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

export function parseOptionalDate(value: unknown, fieldName: string): Date | null {
  const trimmed = asTrimmedString(value);
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new NewsletterCampaignValidationError(`${fieldName} must be a valid date`);
  }

  return parsed;
}

export function parseInteger(value: unknown, fieldName: string, fallback: number, min: number): number {
  if (value === undefined || value === null || value === "") return fallback;

  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new NewsletterCampaignValidationError(`${fieldName} must be ${min} or more`);
  }

  return parsed;
}

export function parseOptionalInteger(value: unknown, fieldName: string, min: number): number | null {
  if (value === undefined || value === null || value === "") return null;

  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new NewsletterCampaignValidationError(`${fieldName} must be ${min} or more`);
  }

  return parsed;
}

export function parseTemplateParams(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parseTemplateParams(parsed);
    } catch {
      return trimmed.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    }
  }

  return [];
}

export function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizePhone(value: string): string {
  const compact = value.replace(/[^\d+]/g, "");
  if (!compact) return compact;
  return compact.startsWith("+") ? compact : `+${compact}`;
}

export function normalizeSmsPhone(value: string): string {
  const compact = value.replace(/[^\d+]/g, "");
  if (!compact) return compact;
  return compact.startsWith("+") ? compact : `+${compact}`;
}

export function getTwilioSmsConfig() {
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

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getLogPrefix(requestId?: string): string {
  return requestId ? `[Newsletter ${requestId}]` : "[Newsletter]";
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : String(error);
}

export function deliveryErrorForChannel(
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

export function dateFromRow(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
