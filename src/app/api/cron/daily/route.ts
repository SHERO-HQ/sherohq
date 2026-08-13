import { NextRequest } from "next/server";
import { apiResponse, validateCronAuth } from "@/lib/api-utils";
import {
  processNewsletterTask,
  processWhatsAppRetriesTask,
  processPendingOrdersRemindersTask,
  processCleanupPendingOrdersTask,
  processAbandonedCartsEmailTask,
  processAbandonedCartsWhatsAppTask,
} from "@/lib/cron-tasks";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient execution window

export async function GET(request: NextRequest) {
  return handleDailyCron(request);
}

export async function POST(request: NextRequest) {
  return handleDailyCron(request);
}

async function handleDailyCron(request: NextRequest) {
  const cronError = validateCronAuth(request);
  if (cronError) return cronError;

  const startTime = Date.now();
  console.log("[Daily Cron] Starting unified daily background job execution...");

  const [
    newsletter,
    whatsappRetries,
    pendingReminders,
    staleOrdersCleanup,
    abandonedEmail,
    abandonedWhatsApp,
  ] = await Promise.allSettled([
    processNewsletterTask(),
    processWhatsAppRetriesTask(),
    processPendingOrdersRemindersTask(),
    processCleanupPendingOrdersTask(),
    processAbandonedCartsEmailTask(),
    processAbandonedCartsWhatsAppTask(),
  ]);

  const summary = {
    newsletter: newsletter.status === "fulfilled" ? newsletter.value : { success: false, error: newsletter.reason },
    whatsappRetries: whatsappRetries.status === "fulfilled" ? whatsappRetries.value : { success: false, error: whatsappRetries.reason },
    pendingReminders: pendingReminders.status === "fulfilled" ? pendingReminders.value : { success: false, error: pendingReminders.reason },
    staleOrdersCleanup: staleOrdersCleanup.status === "fulfilled" ? staleOrdersCleanup.value : { success: false, error: staleOrdersCleanup.reason },
    abandonedEmail: abandonedEmail.status === "fulfilled" ? abandonedEmail.value : { success: false, error: abandonedEmail.reason },
    abandonedWhatsApp: abandonedWhatsApp.status === "fulfilled" ? abandonedWhatsApp.value : { success: false, error: abandonedWhatsApp.reason },
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  console.log("[Daily Cron] Unified daily background job complete:", summary);

  return apiResponse.success(summary);
}
