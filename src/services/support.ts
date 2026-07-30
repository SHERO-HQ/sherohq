import { API_BASE, handleResponse, authFetch } from "./client";

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export interface SupportTicket {
  id: string;
  ticket_no: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  productId?: string;
  userId?: string;
  status: string;
  createdAt: string;
}

export async function createTicket(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  priority?: string;
  productId?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  message: string;
  ticketId: string;
  ticketNo: number;
}> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const response = await authFetch(`${API_BASE}/tickets`);
  return handleResponse(response);
}

export async function updateTicketStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; ticket: SupportTicket }> {
  const response = await authFetch(`${API_BASE}/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Consultations
// ---------------------------------------------------------------------------

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  message?: string;
  status: string;
  createdAt: string;
}

export async function scheduleConsultation(data: {
  service: string;
  date: Date;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const payload = {
    name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    email: data.email,
    phone: data.phone,
    service: data.service,
    date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : String(data.date),
    time: data.time,
    message: data.message,
  };

  const response = await fetch(`${API_BASE}/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function fetchConsultations(): Promise<Consultation[]> {
  const response = await authFetch(`${API_BASE}/consultations`);
  return handleResponse(response);
}

export async function updateConsultationStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; consultation: Consultation }> {
  const response = await authFetch(
    `${API_BASE}/consultations/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}

export async function deleteConsultation(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/consultations/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Contact / Inquiries
// ---------------------------------------------------------------------------

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const response = await authFetch(`${API_BASE}/inquiries`);
  return handleResponse(response);
}

export async function updateInquiryStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; inquiry: Inquiry }> {
  const response = await authFetch(
    `${API_BASE}/inquiries/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}
export async function deleteInquiry(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/inquiries/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export interface NewsletterSubscriber {
  id: string;
  email: string;
  phone?: string | null;
  name?: string | null;
  source?: string | null;
  status: "active" | "unsubscribed";
  subscribedAt: string;
  unsubscribedAt?: string | null;
  lastCampaignAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterCampaign {
  id: string;
  channel: "email" | "sms" | "whatsapp";
  subject: string;
  whatsappTemplateName?: string | null;
  whatsappTemplateLanguage?: string | null;
  whatsappTemplateParams?: string[] | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  audienceStatus: "active" | "unsubscribed" | "all";
  audienceSource?: string | null;
  audienceSubscribedAfter?: string | null;
  audienceSubscribedBefore?: string | null;
  recipientLimit?: number | null;
  batchSize: number;
  sendDelayMs: number;
  isTest: boolean;
  testEmail?: string | null;
  testPhone?: string | null;
  totalTargets: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function subscribeToNewsletter(data: {
  email: string;
  name?: string;
  phone?: string;
  source?: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchNewsletterSubscribers(params?: {
  status?: "all" | "active" | "unsubscribed";
  search?: string;
}): Promise<{
  subscribers: NewsletterSubscriber[];
  counts: {
    total: number;
    active: number;
    unsubscribed: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const url = `${API_BASE}/newsletter/subscribers${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await authFetch(url);
  return handleResponse(response);
}

export async function updateNewsletterSubscriberStatus(
  id: string,
  status: "active" | "unsubscribed",
): Promise<{ success: boolean; subscriber: NewsletterSubscriber }> {
  const response = await authFetch(
    `${API_BASE}/newsletter/subscribers/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}

export async function updateNewsletterSubscriberContact(
  id: string,
  data: {
    phone?: string | null;
    name?: string | null;
  },
): Promise<{ success: boolean; subscriber: NewsletterSubscriber }> {
  const response = await authFetch(
    `${API_BASE}/newsletter/subscribers/${id}/contact`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
}

export async function sendNewsletterCampaign(data: {
  channel?: "email" | "sms" | "whatsapp";
  subject: string;
  content: string;
  testEmail?: string;
  testPhone?: string;
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
  whatsappTemplateParams?: string[];
  batchSize?: number;
  sendDelayMs?: number;
  limit?: number;
  scheduleAt?: string;
  audienceStatus?: "active" | "unsubscribed" | "all";
  audienceSource?: string;
  audienceSubscribedAfter?: string;
  audienceSubscribedBefore?: string;
}): Promise<{
  success: boolean;
  campaignId?: string;
  status?: "scheduled" | "sending";
  sent?: number;
  failed?: number;
  totalTargets?: number;
  batchSize?: number;
  sendDelayMs?: number;
  message: string;
}> {
  const response = await authFetch(`${API_BASE}/newsletter/campaigns/send`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchNewsletterCampaigns(limit = 20): Promise<{
  campaigns: NewsletterCampaign[];
}> {
  const response = await authFetch(
    `${API_BASE}/newsletter/campaigns?limit=${limit}`,
  );
  return handleResponse(response);
}

export async function processScheduledNewsletterCampaigns(): Promise<{
  success: boolean;
  processed: number;
  message: string;
}> {
  const response = await authFetch(
    `${API_BASE}/newsletter/campaigns/process-scheduled`,
    {
      method: "POST",
    },
  );
  return handleResponse(response);
}

export async function deleteNewsletterCampaign(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/newsletter/campaigns/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function cancelNewsletterCampaign(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(
    `${API_BASE}/newsletter/campaigns/${id}/cancel`,
    {
      method: "PATCH",
    },
  );
  return handleResponse(response);
}
