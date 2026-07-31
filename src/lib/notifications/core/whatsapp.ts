import { logActivity } from "@/lib/activity";
import { getErrorMessage } from "@/utils/error";

export function formatToInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `233${digits.slice(1)}`;
  }
  if (digits.startsWith("233") && digits.length === 12) {
    return digits;
  }
  return digits;
}

export async function sendWhatsAppNotification(to: string, message: string) {
  const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn(`[WhatsApp Token Missing - Simulation] To: ${to}`);
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formatToInternationalPhone(to),
          type: "text",
          text: { preview_url: false, body: message },
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Meta API response error");
    }
    console.log(`✅ WhatsApp alert sent successfully to ${to}`);
  } catch (error) {
    const msg = getErrorMessage(error, "WhatsApp Cloud API error");
    console.error(`❌ WhatsApp Cloud API error for ${to}:`, error);
    logActivity(
      null,
      "system_alert",
      "error",
      `WhatsApp notification failed for ${to}: ${msg}`,
    ).catch(() => {});
  }
}
